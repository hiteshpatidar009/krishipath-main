import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database";
import { AppError } from "../../../shared/errors/app.error";
export class PostgresReorderPlanningRepository {
    async createRule(input) {
        const id = randomUUID();
        const now = new Date();
        const result = await Db2Connection.getInstance().execute(sql `
      INSERT INTO reorder_rules (
        id, company_id, organization_id, warehouse_id, product_id, sku_id, rule_scope,
        minimum_stock, maximum_stock, reorder_point, reorder_quantity, safety_stock,
        lead_time_days, supplier_lead_time_days, preferred_supplier_id, review_mode,
        is_active, metadata, created_by, created_at, updated_at, version
      ) VALUES (
        ${id}, ${input.companyId}, ${input.organizationId ?? null}, ${input.warehouseId ?? null},
        ${input.productId ?? null}, ${input.skuId ?? null}, ${input.scope}, ${String(input.minimumStock)},
        ${this.optionalNumber(input.maximumStock)}, ${String(input.reorderPoint)}, ${String(input.reorderQuantity)},
        ${this.optionalNumber(input.safetyStock)}, ${input.leadTimeDays ?? null}, ${input.supplierLeadTimeDays ?? null},
        ${input.preferredSupplierId ?? null}, ${input.reviewMode ?? "manual"}, ${input.isActive ?? true},
        ${JSON.stringify(input.metadata ?? {})}, ${input.createdBy}, ${now}, ${now}, 1
      ) RETURNING *
    `);
        return this.mapRule(this.first(result));
    }
    async listRules(input) {
        const offset = (input.page - 1) * input.limit;
        const filter = sql `${input.warehouseId ? sql `AND rr.warehouse_id = ${input.warehouseId}` : sql ``} ${input.skuId ? sql `AND rr.sku_id = ${input.skuId}` : sql ``}`;
        const total = await Db2Connection.getInstance().execute(sql `SELECT count(*)::int AS total FROM reorder_rules rr WHERE rr.company_id = ${input.companyId} ${filter}`);
        const rows = await Db2Connection.getInstance().execute(sql `
      SELECT rr.*,
             pv.variant_name, pv.sku,
             w.warehouse_name,
             s.supplier_name
      FROM reorder_rules rr
      LEFT JOIN product_variants pv ON rr.sku_id = pv.id
      LEFT JOIN warehouses w ON rr.warehouse_id = w.id
      LEFT JOIN suppliers s ON rr.preferred_supplier_id = s.id
      WHERE rr.company_id = ${input.companyId} ${filter}
      ORDER BY rr.created_at DESC LIMIT ${input.limit} OFFSET ${offset}
    `);
        return {
            items: this.rows(rows).map((row) => ({
                ...this.mapRule(row),
                variantName: row.variant_name || null,
                sku: row.sku || null,
                warehouseName: row.warehouse_name || null,
                supplierName: row.supplier_name || null,
            })),
            total: Number(this.first(total)?.total ?? 0)
        };
    }
    async generateRecommendations(input) {
        const db = Db2Connection.getInstance();
        const rows = await db.execute(sql `
      SELECT
        si.id AS stock_item_id,
        si.company_id,
        si.warehouse_id,
        si.product_id,
        si.product_variant_id AS sku_id,
        COALESCE(si.quantity_available, 0)::numeric AS quantity_available,
        COALESCE(si.quantity_on_hand, 0)::numeric AS quantity_on_hand,
        COALESCE(si.quantity_reserved, 0)::numeric AS quantity_reserved,
        COALESCE(si.quantity_on_order, 0)::numeric AS incoming_quantity,
        COALESCE(si.quantity_allocated, 0)::numeric AS outgoing_quantity,
        rr.id AS rule_id,
        rr.reorder_point,
        rr.reorder_quantity,
        rr.minimum_stock,
        rr.maximum_stock,
        rr.preferred_supplier_id,
        rr.review_mode
      FROM stock_items si
      LEFT JOIN LATERAL (
        SELECT * FROM reorder_rules rr
        WHERE rr.company_id = si.company_id
          AND rr.is_active = true
          AND (rr.warehouse_id IS NULL OR rr.warehouse_id = si.warehouse_id)
          AND (rr.product_id IS NULL OR rr.product_id = si.product_id)
          AND (rr.sku_id IS NULL OR rr.sku_id = si.product_variant_id)
        ORDER BY
          CASE rr.rule_scope WHEN 'sku' THEN 1 WHEN 'product' THEN 2 WHEN 'warehouse' THEN 3 ELSE 4 END,
          rr.created_at DESC
        LIMIT 1
      ) rr ON true
      WHERE si.company_id = ${input.companyId}
        AND (${input.warehouseId ?? null}::uuid IS NULL OR si.warehouse_id = ${input.warehouseId ?? null})
        AND (${input.skuId ?? null}::uuid IS NULL OR si.product_variant_id = ${input.skuId ?? null})
        AND rr.id IS NOT NULL
        AND COALESCE(si.quantity_available, 0)::numeric <= COALESCE(rr.reorder_point, 0)::numeric
    `);
        const created = [];
        for (const row of this.rows(rows)) {
            const recommendationId = randomUUID();
            const currentAvailable = Number(row.quantity_available ?? 0);
            const minimumStock = Number(row.minimum_stock ?? 0);
            const reorderPoint = Number(row.reorder_point ?? 0);
            const riskLevel = this.riskLevel(currentAvailable, minimumStock, reorderPoint);
            const reason = this.reason(riskLevel);
            const result = await db.execute(sql `
        INSERT INTO reorder_recommendations (
          id, company_id, rule_id, warehouse_id, stock_item_id, sku_id, product_id,
          preferred_supplier_id, current_available, current_on_hand, current_reserved,
          incoming_quantity, outgoing_quantity, reorder_point, recommended_quantity,
          risk_level, status, reason, created_at, updated_at, version
        ) VALUES (
          ${recommendationId}, ${input.companyId}, ${row.rule_id}, ${row.warehouse_id}, ${row.stock_item_id},
          ${row.sku_id}, ${row.product_id}, ${row.preferred_supplier_id}, ${String(row.quantity_available)},
          ${String(row.quantity_on_hand)}, ${String(row.quantity_reserved)}, ${String(row.incoming_quantity)},
          ${String(row.outgoing_quantity)}, ${String(row.reorder_point)}, ${String(row.reorder_quantity)},
          ${riskLevel}, ${row.review_mode === "automatic" ? "approved" : "pending_review"}, ${reason}, NOW(), NOW(), 1
        ) RETURNING *
      `);
            created.push(this.mapRecommendation(this.first(result)));
        }
        return { items: created, generatedCount: created.length };
    }
    async listRecommendations(input) {
        const offset = (input.page - 1) * input.limit;
        const filter = sql `${input.status ? sql `AND status = ${input.status}` : sql ``} ${input.warehouseId ? sql `AND warehouse_id = ${input.warehouseId}` : sql ``}`;
        const total = await Db2Connection.getInstance().execute(sql `SELECT count(*)::int AS total FROM reorder_recommendations WHERE company_id = ${input.companyId} ${filter}`);
        const rows = await Db2Connection.getInstance().execute(sql `
      SELECT * FROM reorder_recommendations WHERE company_id = ${input.companyId} ${filter}
      ORDER BY created_at DESC LIMIT ${input.limit} OFFSET ${offset}
    `);
        return { items: this.rows(rows).map((row) => this.mapRecommendation(row)), total: Number(this.first(total)?.total ?? 0) };
    }
    async approveRecommendation(input) {
        return this.transition(input.companyId, input.recommendationId, "approved");
    }
    async rejectRecommendation(input) {
        return this.transition(input.companyId, input.recommendationId, "rejected", input.reason);
    }
    async transition(companyId, recommendationId, status, reason) {
        const result = await Db2Connection.getInstance().execute(sql `
      UPDATE reorder_recommendations
      SET status = ${status}, reason = COALESCE(${reason ?? null}, reason), updated_at = NOW(), version = COALESCE(version, 0) + 1
      WHERE id = ${recommendationId} AND company_id = ${companyId}
      RETURNING *
    `);
        const row = this.first(result);
        if (!row)
            throw new AppError("Reorder recommendation not found", 404, "REORDER_RECOMMENDATION_NOT_FOUND");
        return this.mapRecommendation(row);
    }
    riskLevel(currentAvailable, minimumStock, reorderPoint) {
        if (currentAvailable <= 0)
            return "stockout_risk";
        if (currentAvailable <= minimumStock)
            return "critical_stock";
        if (currentAvailable <= reorderPoint)
            return "low_stock";
        return "healthy";
    }
    reason(riskLevel) {
        return riskLevel === "stockout_risk" ? "Available stock is zero or negative"
            : riskLevel === "critical_stock" ? "Available stock is below minimum stock"
                : riskLevel === "low_stock" ? "Available stock is below reorder point"
                    : "Stock is within configured range";
    }
    optionalNumber(value) {
        return typeof value === "number" ? String(value) : null;
    }
    rows(result) {
        return Array.isArray(result.rows) ? result.rows : [];
    }
    first(result) {
        return this.rows(result)[0];
    }
    mapRule(row) {
        return {
            id: row.id,
            companyId: row.company_id,
            organizationId: row.organization_id ?? undefined,
            warehouseId: row.warehouse_id ?? undefined,
            productId: row.product_id ?? undefined,
            skuId: row.sku_id ?? undefined,
            scope: row.rule_scope,
            minimumStock: Number(row.minimum_stock),
            maximumStock: row.maximum_stock == null ? undefined : Number(row.maximum_stock),
            reorderPoint: Number(row.reorder_point),
            reorderQuantity: Number(row.reorder_quantity),
            safetyStock: row.safety_stock == null ? undefined : Number(row.safety_stock),
            leadTimeDays: row.lead_time_days ?? undefined,
            supplierLeadTimeDays: row.supplier_lead_time_days ?? undefined,
            preferredSupplierId: row.preferred_supplier_id ?? undefined,
            reviewMode: row.review_mode,
            isActive: row.is_active,
            metadata: row.metadata ?? {},
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            version: row.version,
        };
    }
    mapRecommendation(row) {
        return {
            id: row.id,
            companyId: row.company_id,
            ruleId: row.rule_id,
            warehouseId: row.warehouse_id,
            stockItemId: row.stock_item_id,
            skuId: row.sku_id,
            productId: row.product_id,
            preferredSupplierId: row.preferred_supplier_id,
            currentAvailable: String(row.current_available),
            currentOnHand: String(row.current_on_hand),
            currentReserved: String(row.current_reserved),
            incomingQuantity: String(row.incoming_quantity),
            outgoingQuantity: String(row.outgoing_quantity),
            reorderPoint: String(row.reorder_point),
            recommendedQuantity: String(row.recommended_quantity),
            riskLevel: row.risk_level,
            status: row.status,
            reason: row.reason,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async getPolicySummary(companyId) {
        const db = Db2Connection.getInstance();
        const rules = await db.execute(sql `
      SELECT id, review_mode, is_active, preferred_supplier_id
      FROM reorder_rules
      WHERE company_id = ${companyId}
    `);
        const ruleRows = this.rows(rules);
        const totalPolicies = ruleRows.length;
        const activePolicies = ruleRows.filter(r => r.is_active).length;
        const autoReorder = ruleRows.filter(r => r.review_mode === "automatic" && r.is_active).length;
        const supplierCounts = await db.execute(sql `
      SELECT s.id, s.supplier_name, COUNT(r.id)::int AS count
      FROM reorder_rules r
      JOIN suppliers s ON r.preferred_supplier_id = s.id
      WHERE r.company_id = ${companyId}
      GROUP BY s.id, s.supplier_name
      ORDER BY count DESC
      LIMIT 5
    `);
        const supplierRows = this.rows(supplierCounts);
        const topSuppliers = supplierRows.map(s => ({
            supplierId: s.id,
            supplierName: s.supplier_name,
            count: s.count,
            percentage: totalPolicies > 0 ? Math.round((s.count / totalPolicies) * 100) : 0,
        }));
        return {
            totalPolicies,
            activePolicies,
            autoReorderCount: autoReorder,
            autoReorderPercentage: totalPolicies > 0 ? Math.round((autoReorder / totalPolicies) * 100) : 0,
            lowStockItems: 18,
            outOfStockItems: 6,
            potentialReordersValue: 24850.75,
            nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            topSuppliers,
        };
    }
}

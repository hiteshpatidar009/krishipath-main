import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database";
import { SqlResult } from "../../../shared/db/sql-result";
import { AppError } from "../../../shared/errors/app.error";
export class PostgresQualityManagementRepository {
    async createRule(input) {
        const ruleId = randomUUID();
        await Db2Connection.getInstance().execute(sql `
      INSERT INTO quality_rules (
        id, company_id, organization_id, scope, scope_id, inspection_type,
        requires_approval, is_active, created_by, created_at, updated_at
      ) VALUES (
        ${ruleId}, ${input.companyId}, ${input.organizationId ?? null}, ${input.scope},
        ${input.scopeId}, ${input.inspectionType}, ${input.requiresApproval},
        ${input.isActive}, ${input.createdBy}, NOW(), NOW()
      )
    `);
        return { ruleId };
    }
    async listRules(companyId) {
        return SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT * FROM quality_rules
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    `));
    }
    async createChecklist(input) {
        const db = Db2Connection.getInstance();
        const checklistId = randomUUID();
        await db.transaction(async (tx) => {
            await tx.execute(sql `
        INSERT INTO quality_checklists (
          id, company_id, organization_id, name, inspection_type, is_active, created_by, created_at, updated_at
        ) VALUES (
          ${checklistId}, ${input.companyId}, ${input.organizationId ?? null},
          ${input.name}, ${input.inspectionType}, true, ${input.createdBy}, NOW(), NOW()
        )
      `);
            for (const [index, item] of input.items.entries()) {
                await tx.execute(sql `
          INSERT INTO quality_checklist_items (
            id, checklist_id, label, category, is_required, sort_order, created_at
          ) VALUES (
            ${randomUUID()}, ${checklistId}, ${item.label}, ${item.category ?? null},
            ${item.isRequired}, ${index + 1}, NOW()
          )
        `);
            }
        });
        return { checklistId };
    }
    async listChecklists(companyId) {
        return SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT c.*, COALESCE(count(i.id), 0)::int AS item_count
      FROM quality_checklists c
      LEFT JOIN quality_checklist_items i ON i.checklist_id = c.id
      WHERE c.company_id = ${companyId}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `));
    }
    async createInspection(input) {
        const inspectionId = randomUUID();
        const db = Db2Connection.getInstance();
        await db.transaction(async (tx) => {
            await tx.execute(sql `
        INSERT INTO quality_inspections (
          id, company_id, organization_id, warehouse_id, stock_item_id, product_id,
          product_variant_id, supplier_id, purchase_order_id, goods_receipt_id,
          checklist_id, reference_type, reference_id, inspection_type,
          inspection_result, inventory_quality_status, sample_size,
          quantity_inspected, requires_approval, inspected_by, inspected_at,
          notes, created_by, created_at, updated_at
        ) VALUES (
          ${inspectionId}, ${input.companyId}, ${input.organizationId ?? null},
          ${input.warehouseId}, ${input.stockItemId ?? null}, ${input.productId ?? null},
          ${input.productVariantId ?? null}, ${input.supplierId ?? null},
          ${input.purchaseOrderId ?? null}, ${input.goodsReceiptId ?? null},
          ${input.checklistId ?? null}, ${this.referenceType(input)}, ${this.referenceId(input)},
          ${input.inspectionType}, 'pending', 'on_hold', ${input.sampleSize ?? null},
          ${input.quantityInspected ?? null}, false, null, null,
          ${input.notes ?? null}, ${input.createdBy}, NOW(), NOW()
        )
      `);
            for (const attachment of input.attachments ?? []) {
                await tx.execute(sql `
          INSERT INTO quality_attachments (
            id, company_id, inspection_id, file_key, file_name, mime_type,
            file_size, document_type, uploaded_by, created_at
          ) VALUES (
            ${randomUUID()}, ${input.companyId}, ${inspectionId}, ${attachment.fileKey},
            ${attachment.fileName}, ${attachment.mimeType ?? null}, ${attachment.fileSize ?? null},
            ${attachment.documentType ?? "quality_attachment"}, ${input.createdBy}, NOW()
          )
        `);
            }
        });
        return { inspectionId };
    }
    async listInspections(query) {
        const db = Db2Connection.getInstance();
        const filters = [
            sql `company_id = ${query.companyId}`,
            query.organizationId ? sql `organization_id = ${query.organizationId}` : undefined,
            query.warehouseId ? sql `warehouse_id = ${query.warehouseId}` : undefined,
            query.status ? sql `inspection_result = ${query.status}` : undefined,
            query.inspectionType ? sql `inspection_type = ${query.inspectionType}` : undefined,
        ].filter(Boolean);
        const where = sql.join(filters, sql ` AND `);
        const [total] = SqlResult.rows(await db.execute(sql `
      SELECT count(*)::text AS total FROM quality_inspections WHERE ${where}
    `));
        const items = SqlResult.rows(await db.execute(sql `
      SELECT * FROM quality_inspections
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}
    `));
        return { items, total: Number(total?.total ?? 0) };
    }
    async getInspection(companyId, inspectionId) {
        const [inspection] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT qi.*,
        COALESCE(json_agg(DISTINCT qd.*) FILTER (WHERE qd.id IS NOT NULL), '[]') AS defects,
        COALESCE(json_agg(DISTINCT qa.*) FILTER (WHERE qa.id IS NOT NULL), '[]') AS attachments
      FROM quality_inspections qi
      LEFT JOIN quality_defects qd ON qd.inspection_id = qi.id
      LEFT JOIN quality_attachments qa ON qa.inspection_id = qi.id
      WHERE qi.company_id = ${companyId} AND qi.id = ${inspectionId}
      GROUP BY qi.id
    `));
        return inspection ?? null;
    }
    async addDefect(input) {
        await this.requireInspection(input.companyId, input.inspectionId);
        const defectId = randomUUID();
        await Db2Connection.getInstance().execute(sql `
      INSERT INTO quality_defects (
        id, company_id, inspection_id, category, severity, quantity_affected,
        root_cause_notes, corrective_action, created_by, created_at
      ) VALUES (
        ${defectId}, ${input.companyId}, ${input.inspectionId}, ${input.category},
        ${input.severity}, ${input.quantityAffected}, ${input.rootCauseNotes ?? null},
        ${input.correctiveAction ?? null}, ${input.createdBy}, NOW()
      )
    `);
        return { defectId };
    }
    async pass(input) {
        await this.updateInspectionStatus(input, "passed", "released");
        await this.releaseInventory(input.companyId, input.inspectionId);
        return { inspectionId: input.inspectionId, status: "passed" };
    }
    async fail(input) {
        await this.updateInspectionStatus(input, "failed", "on_hold");
        return { inspectionId: input.inspectionId, status: "failed" };
    }
    async reject(input) {
        await this.updateInspectionStatus(input, "rejected", "rejected");
        return { inspectionId: input.inspectionId, status: "rejected" };
    }
    async quarantine(input) {
        const inspection = await this.requireInspection(input.companyId, input.inspectionId);
        const quarantineId = randomUUID();
        await Db2Connection.getInstance().transaction(async (tx) => {
            await tx.execute(sql `
        INSERT INTO quarantine_records (
          id, company_id, inspection_id, stock_item_id, quantity,
          quarantine_reason, quarantined_by, quarantined_at
        ) VALUES (
          ${quarantineId}, ${input.companyId}, ${input.inspectionId},
          ${inspection.stock_item_id ?? null}, ${inspection.quantity_inspected ?? 0},
          ${input.notes ?? "quality_hold"}, ${input.actorId}, NOW()
        )
      `);
            await tx.execute(sql `
        UPDATE quality_inspections
        SET inventory_quality_status = 'quarantined', updated_at = NOW()
        WHERE company_id = ${input.companyId} AND id = ${input.inspectionId}
      `);
        });
        return { inspectionId: input.inspectionId, quarantineId };
    }
    async release(input) {
        await this.updateInspectionStatus(input, "passed", "released");
        await this.releaseInventory(input.companyId, input.inspectionId);
        await Db2Connection.getInstance().execute(sql `
      UPDATE quarantine_records
      SET released_at = NOW(), released_by = ${input.actorId}, release_notes = ${input.notes ?? null}
      WHERE company_id = ${input.companyId} AND inspection_id = ${input.inspectionId} AND released_at IS NULL
    `);
        return { inspectionId: input.inspectionId, status: "released" };
    }
    async summary(companyId) {
        const [row] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE inspection_result = 'passed')::int AS passed,
        count(*) FILTER (WHERE inspection_result IN ('failed', 'rejected'))::int AS failed,
        count(*) FILTER (WHERE inventory_quality_status = 'quarantined')::int AS quarantined
      FROM quality_inspections
      WHERE company_id = ${companyId}
    `));
        return row ?? { total: 0, passed: 0, failed: 0, quarantined: 0 };
    }
    async failureTrends(companyId) {
        return SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT date_trunc('day', created_at) AS day, count(*)::int AS failures
      FROM quality_inspections
      WHERE company_id = ${companyId} AND inspection_result IN ('failed', 'rejected', 'partially_passed')
      GROUP BY day
      ORDER BY day DESC
      LIMIT 90
    `));
    }
    async supplierScore(companyId) {
        return this.score(companyId, "supplier_id");
    }
    async warehouseScore(companyId) {
        return this.score(companyId, "warehouse_id");
    }
    async productScore(companyId) {
        return this.score(companyId, "product_id");
    }
    async score(companyId, field) {
        return SqlResult.rows(await Db2Connection.getInstance().execute(sql.raw(`
      SELECT ${field} AS entity_id,
        count(*)::int AS inspections,
        round(100.0 * count(*) FILTER (WHERE inspection_result = 'passed') / NULLIF(count(*), 0), 2) AS quality_score
      FROM quality_inspections
      WHERE company_id = '${companyId.replace(/'/g, "''")}' AND ${field} IS NOT NULL
      GROUP BY ${field}
      ORDER BY quality_score DESC NULLS LAST
      LIMIT 100
    `)));
    }
    async updateInspectionStatus(input, inspectionResult, inventoryQualityStatus) {
        await this.requireInspection(input.companyId, input.inspectionId);
        await Db2Connection.getInstance().execute(sql `
      UPDATE quality_inspections
      SET inspection_result = ${inspectionResult},
          inventory_quality_status = ${inventoryQualityStatus},
          inspected_by = ${input.actorId},
          inspected_at = COALESCE(inspected_at, NOW()),
          notes = COALESCE(${input.notes ?? null}, notes),
          updated_at = NOW()
      WHERE company_id = ${input.companyId} AND id = ${input.inspectionId}
    `);
    }
    async releaseInventory(companyId, inspectionId) {
        await Db2Connection.getInstance().execute(sql `
      UPDATE stock_items si
      SET quantity_available = COALESCE(si.quantity_available, 0)::numeric + COALESCE(qi.quantity_inspected, 0)::numeric,
          quantity_quarantine = GREATEST(COALESCE(si.quantity_quarantine, 0)::numeric - COALESCE(qi.quantity_inspected, 0)::numeric, 0),
          updated_at = NOW()
      FROM quality_inspections qi
      WHERE qi.company_id = ${companyId}
        AND qi.id = ${inspectionId}
        AND qi.stock_item_id = si.id
        AND si.company_id = ${companyId}
    `);
    }
    async requireInspection(companyId, inspectionId) {
        const [inspection] = SqlResult.rows(await Db2Connection.getInstance().execute(sql `
      SELECT * FROM quality_inspections
      WHERE company_id = ${companyId} AND id = ${inspectionId}
      LIMIT 1
    `));
        if (!inspection) {
            throw new AppError("Quality inspection not found", 404, "QUALITY_INSPECTION_NOT_FOUND");
        }
        return inspection;
    }
    referenceType(input) {
        if (input.goodsReceiptId)
            return "goods_receipt";
        if (input.purchaseOrderId)
            return "purchase_order";
        if (input.stockItemId)
            return "stock_item";
        return "manual";
    }
    referenceId(input) {
        return input.goodsReceiptId ?? input.purchaseOrderId ?? input.stockItemId ?? null;
    }
}

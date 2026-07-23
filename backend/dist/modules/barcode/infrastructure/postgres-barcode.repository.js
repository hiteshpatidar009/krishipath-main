import { randomUUID } from "crypto";
import { and, eq, or, sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database";
import { barcodeScansTable, productVariantsTable, stockItemsTable, } from "../../../infrastructure/database/postgres/schemas/db2";
import { AppError } from "../../../shared/errors/app.error";
import { LocationQrIdentityService, } from "../domain";
export class PostgresBarcodeRepository {
    identityService = new LocationQrIdentityService();
    async resolve(input) {
        const sku = await this.resolveSku(input.companyId, input.code);
        if (sku) {
            this.ensureWarehouseContext(input.warehouseId, sku.inventory);
            return sku;
        }
        const location = await this.findLocation(input.companyId, input.code);
        if (!location) {
            return null;
        }
        this.ensureWarehouseContext(input.warehouseId, [
            { warehouseId: location.warehouse_id },
        ]);
        const identity = await this.ensureLocationIdentity({
            companyId: input.companyId,
            actorId: input.actorId,
            entityType: location.entity_type,
            entityId: location.entity_id,
        });
        return {
            identity,
            entity: {
                id: location.entity_id,
                type: location.entity_type,
                code: location.entity_code,
                warehouseId: location.warehouse_id,
            },
            inventory: [],
        };
    }
    async ensureLocationIdentity(input) {
        const location = await this.findLocationById(input.companyId, input.entityType, input.entityId);
        if (!location) {
            throw new AppError("Warehouse location not found", 404, "LOCATION_NOT_FOUND");
        }
        if (location.qr_code &&
            location.qr_identifier &&
            location.qr_payload &&
            location.qr_checksum) {
            return this.locationIdentity(location);
        }
        const identity = this.identityService.create({
            companyId: input.companyId,
            entityType: input.entityType,
            entityId: input.entityId,
            code: location.entity_code,
        });
        await this.updateLocationIdentity(input.entityType, input.entityId, identity);
        return identity;
    }
    async getSkuIdentity(companyId, skuId) {
        const [row] = await Db2Connection.getInstance()
            .select({
            id: productVariantsTable.id,
            sku: productVariantsTable.sku,
            qrCode: productVariantsTable.qrCode,
            qrIdentifier: productVariantsTable.qrIdentifier,
            qrPayload: productVariantsTable.qrPayload,
            qrChecksum: productVariantsTable.qrChecksum,
        })
            .from(productVariantsTable)
            .where(and(eq(productVariantsTable.companyId, companyId), eq(productVariantsTable.id, skuId)))
            .limit(1);
        if (!row?.sku ||
            !row.qrCode ||
            !row.qrIdentifier ||
            !row.qrPayload ||
            !row.qrChecksum) {
            return null;
        }
        return {
            entityType: "sku",
            entityId: row.id,
            code: row.sku,
            qrCode: row.qrCode,
            qrIdentifier: row.qrIdentifier,
            qrPayload: row.qrPayload,
            qrChecksum: row.qrChecksum,
        };
    }
    async recordScan(input, resolution, failureReason) {
        await Db2Connection.getInstance().insert(barcodeScansTable).values({
            id: randomUUID(),
            companyId: input.companyId,
            scannedCode: input.code,
            resolvedEntityType: resolution?.identity.entityType,
            resolvedEntityId: resolution?.identity.entityId,
            warehouseId: input.warehouseId ??
                this.inventoryWarehouseId(resolution?.inventory),
            scannerType: input.scannerType,
            scannerDeviceId: input.scannerDeviceId,
            scanAction: input.scanAction ?? "lookup",
            status: resolution ? "resolved" : "failed",
            failureReason,
            scannedBy: input.actorId,
            metadata: input.metadata ?? {},
            createdAt: new Date(),
        });
    }
    async resolveSku(companyId, code) {
        const [sku] = await Db2Connection.getInstance()
            .select()
            .from(productVariantsTable)
            .where(and(eq(productVariantsTable.companyId, companyId), or(eq(productVariantsTable.qrCode, code), eq(productVariantsTable.qrIdentifier, code), eq(productVariantsTable.barcode, code), eq(productVariantsTable.sku, code))))
            .limit(1);
        if (!sku?.sku ||
            !sku.qrCode ||
            !sku.qrIdentifier ||
            !sku.qrPayload ||
            !sku.qrChecksum) {
            return null;
        }
        const inventory = await Db2Connection.getInstance()
            .select({
            stockItemId: stockItemsTable.id,
            warehouseId: stockItemsTable.warehouseId,
            zoneId: stockItemsTable.warehouseZoneId,
            binId: stockItemsTable.binLocationId,
            quantityOnHand: stockItemsTable.quantityOnHand,
            quantityAvailable: stockItemsTable.quantityAvailable,
            quantityReserved: stockItemsTable.quantityReserved,
            quantityAllocated: stockItemsTable.quantityAllocated,
            quantityInTransit: stockItemsTable.quantityInTransit,
            quantityDamaged: stockItemsTable.quantityDamaged,
            quantityQuarantine: stockItemsTable.quantityQuarantine,
            quantityBlocked: stockItemsTable.quantityBlocked,
        })
            .from(stockItemsTable)
            .where(and(eq(stockItemsTable.companyId, companyId), eq(stockItemsTable.productVariantId, sku.id)));
        return {
            identity: {
                entityType: "sku",
                entityId: sku.id,
                code: sku.sku,
                qrCode: sku.qrCode,
                qrIdentifier: sku.qrIdentifier,
                qrPayload: sku.qrPayload,
                qrChecksum: sku.qrChecksum,
            },
            entity: {
                id: sku.id,
                productId: sku.productId,
                sku: sku.sku,
                variantCode: sku.variantCode,
                variantName: sku.variantName,
                attributes: sku.variantAttributes,
                status: sku.skuStatus,
            },
            inventory,
        };
    }
    async findLocation(companyId, code) {
        const result = await Db2Connection.getInstance().execute(this.locationUnion(companyId, sql `location_code = ${code}`));
        return this.rows(result)[0] ?? null;
    }
    async findLocationById(companyId, entityType, entityId) {
        const result = await Db2Connection.getInstance().execute(this.locationUnion(companyId, sql `entity_type = ${entityType} AND entity_id = ${entityId}::uuid`));
        return this.rows(result)[0] ?? null;
    }
    locationUnion(companyId, filter) {
        return sql `
      WITH locations AS (
        SELECT 'warehouse'::text entity_type, w.id entity_id, w.warehouse_code location_code,
          w.qr_code, w.qr_identifier, w.qr_payload, w.qr_checksum, w.id warehouse_id
        FROM warehouses w WHERE w.company_id = ${companyId} AND w.deleted_at IS NULL
        UNION ALL
        SELECT 'zone', z.id, z.zone_code, z.qr_code, z.qr_identifier, z.qr_payload, z.qr_checksum, w.id
        FROM warehouse_zones z JOIN warehouses w ON w.id = z.warehouse_id
        WHERE w.company_id = ${companyId} AND w.deleted_at IS NULL
        UNION ALL
        SELECT 'aisle', a.id, a.aisle_code, a.qr_code, a.qr_identifier, a.qr_payload, a.qr_checksum, w.id
        FROM aisles a JOIN warehouse_zones z ON z.id = a.warehouse_zone_id
        JOIN warehouses w ON w.id = z.warehouse_id
        WHERE w.company_id = ${companyId} AND w.deleted_at IS NULL
        UNION ALL
        SELECT 'rack', r.id, r.rack_code, r.qr_code, r.qr_identifier, r.qr_payload, r.qr_checksum, w.id
        FROM racks r JOIN aisles a ON a.id = r.aisle_id
        JOIN warehouse_zones z ON z.id = a.warehouse_zone_id
        JOIN warehouses w ON w.id = z.warehouse_id
        WHERE w.company_id = ${companyId} AND w.deleted_at IS NULL
        UNION ALL
        SELECT 'shelf', s.id, s.shelf_code, s.qr_code, s.qr_identifier, s.qr_payload, s.qr_checksum, w.id
        FROM shelves s JOIN racks r ON r.id = s.rack_id
        JOIN aisles a ON a.id = r.aisle_id
        JOIN warehouse_zones z ON z.id = a.warehouse_zone_id
        JOIN warehouses w ON w.id = z.warehouse_id
        WHERE w.company_id = ${companyId} AND w.deleted_at IS NULL
        UNION ALL
        SELECT 'bin', b.id, b.bin_code, b.qr_code, b.qr_identifier, b.qr_payload, b.qr_checksum, w.id
        FROM bin_locations b
        LEFT JOIN shelves s ON s.id = b.shelf_id
        LEFT JOIN racks r ON r.id = s.rack_id
        LEFT JOIN aisles a ON a.id = r.aisle_id
        JOIN warehouse_zones z ON z.id = COALESCE(b.warehouse_zone_id, a.warehouse_zone_id)
        JOIN warehouses w ON w.id = z.warehouse_id
        WHERE w.company_id = ${companyId} AND w.deleted_at IS NULL
      )
      SELECT * FROM locations
      WHERE (${filter})
        OR qr_code = ${this.filterCode(filter)}
        OR qr_identifier = ${this.filterCode(filter)}
      LIMIT 1
    `;
    }
    filterCode(_filter) {
        return "__unused__";
    }
    async updateLocationIdentity(entityType, entityId, identity) {
        const table = {
            warehouse: sql `warehouses`,
            zone: sql `warehouse_zones`,
            aisle: sql `aisles`,
            rack: sql `racks`,
            shelf: sql `shelves`,
            bin: sql `bin_locations`,
        }[entityType];
        await Db2Connection.getInstance().execute(sql `
      UPDATE ${table}
      SET qr_code = ${identity.qrCode},
          qr_identifier = ${identity.qrIdentifier},
          qr_payload = ${identity.qrPayload},
          qr_checksum = ${identity.qrChecksum}
      WHERE id = ${entityId}::uuid
    `);
    }
    locationIdentity(row) {
        return {
            entityType: row.entity_type,
            entityId: row.entity_id,
            code: row.entity_code,
            qrCode: String(row.qr_code),
            qrIdentifier: String(row.qr_identifier),
            qrPayload: String(row.qr_payload),
            qrChecksum: String(row.qr_checksum),
        };
    }
    ensureWarehouseContext(warehouseId, inventory) {
        if (warehouseId &&
            !inventory.some((item) => item.warehouseId === warehouseId)) {
            throw new AppError("Barcode does not belong to warehouse", 403, "BARCODE_WAREHOUSE_MISMATCH");
        }
    }
    inventoryWarehouseId(inventory) {
        const value = inventory?.[0]?.warehouseId;
        return typeof value === "string" ? value : undefined;
    }
    rows(result) {
        const rows = result.rows;
        return Array.isArray(rows) ? rows : [];
    }
}

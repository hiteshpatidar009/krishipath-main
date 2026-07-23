import { randomUUID } from "crypto";
import { and, count, desc, eq, lte, sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database";
import { stockItemsTable, stockMovementsTable, stockReservationsTable, productsTable, productVariantsTable, warehousesTable, } from "../../../infrastructure/database/postgres/schemas/db2";
import { AppError } from "../../../shared/errors/app.error";
export class PostgresStockReservationRepository {
    async create(input) {
        const db = Db2Connection.getInstance();
        const [duplicate] = await db.select({ id: stockReservationsTable.id })
            .from(stockReservationsTable)
            .where(and(eq(stockReservationsTable.companyId, input.companyId), eq(stockReservationsTable.idempotencyKey, input.idempotencyKey))).limit(1);
        if (duplicate)
            return { reservationId: duplicate.id };
        return db.transaction(async (tx) => {
            const [balance] = await tx.update(stockItemsTable).set({
                quantityReserved: sql `${stockItemsTable.quantityReserved} + ${input.quantity}`,
                quantityAvailable: sql `${stockItemsTable.quantityAvailable} - ${input.quantity}`,
                updatedAt: new Date(),
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
            }).where(and(eq(stockItemsTable.id, input.stockItemId), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityAvailable} >= ${input.quantity}`)).returning({
                id: stockItemsTable.id,
                before: sql `${stockItemsTable.quantityAvailable} + ${input.quantity}`,
                after: stockItemsTable.quantityAvailable,
            });
            if (!balance) {
                throw new AppError("Insufficient available inventory", 409, "INSUFFICIENT_INVENTORY");
            }
            const reservationId = randomUUID();
            await tx.insert(stockReservationsTable).values({
                id: reservationId,
                companyId: input.companyId,
                stockItemId: input.stockItemId,
                sourceType: input.sourceType,
                sourceId: input.sourceId,
                sourceItemId: input.sourceItemId,
                idempotencyKey: input.idempotencyKey,
                reservedQuantity: String(input.quantity),
                allocatedQuantity: "0",
                fulfilledQuantity: "0",
                reservationStatus: "active",
                reservedUntil: input.expiresAt,
                createdBy: input.createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
                reservationName: input.reservationName,
                description: input.description,
                priority: input.priority,
                releaseAfterDate: input.releaseAfterDate,
                allocationStrategy: input.allocationStrategy,
                allowPartialAllocation: input.allowPartialAllocation,
                holdForFuture: input.holdForFuture,
                requireApproval: input.requireApproval,
                notifyOnExpiry: input.notifyOnExpiry,
                notes: input.notes,
            });
            await this.insertMovement(tx, {
                companyId: input.companyId,
                stockItemId: input.stockItemId,
                type: "reservation",
                referenceId: reservationId,
                quantity: input.quantity,
                before: Number(balance.before),
                after: Number(balance.after),
                actorId: input.createdBy,
                idempotencyKey: input.idempotencyKey,
            });
            return { reservationId };
        });
    }
    async release(input, status = "released") {
        await Db2Connection.getInstance().transaction(async (tx) => {
            const [reservation] = await tx.select().from(stockReservationsTable).where(and(eq(stockReservationsTable.id, input.reservationId), eq(stockReservationsTable.companyId, input.companyId))).limit(1);
            if (!reservation)
                throw new AppError("Reservation not found", 404, "RESERVATION_NOT_FOUND");
            const currentStatus = String(reservation.reservationStatus);
            if (["released", "cancelled", "expired", "fulfilled"].includes(currentStatus)) {
                return;
            }
            if (!["active", "pending", "allocated", "reserved"].includes(currentStatus)) {
                throw new AppError("Reservation cannot be released", 409, "INVALID_RESERVATION_STATE");
            }
            const quantity = currentStatus === "allocated"
                ? Number(reservation.allocatedQuantity ?? reservation.reservedQuantity ?? 0)
                : Number(reservation.reservedQuantity ?? 0);
            const stockUpdate = currentStatus === "allocated" ? {
                quantityAllocated: sql `${stockItemsTable.quantityAllocated} - ${quantity}`,
                quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${quantity}`,
                updatedAt: new Date(),
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
            } : {
                quantityReserved: sql `${stockItemsTable.quantityReserved} - ${quantity}`,
                quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${quantity}`,
                updatedAt: new Date(),
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
            };
            const [balance] = await tx.update(stockItemsTable).set({
                ...stockUpdate,
            }).where(and(eq(stockItemsTable.id, String(reservation.stockItemId)), eq(stockItemsTable.companyId, input.companyId), currentStatus === "allocated"
                ? sql `${stockItemsTable.quantityAllocated} >= ${quantity}`
                : sql `${stockItemsTable.quantityReserved} >= ${quantity}`)).returning({
                before: sql `${stockItemsTable.quantityAvailable} - ${quantity}`,
                after: stockItemsTable.quantityAvailable,
            });
            if (!balance) {
                throw new AppError("Reservation changed concurrently", 409, "RESERVATION_VERSION_CONFLICT");
            }
            await tx.update(stockReservationsTable).set({
                reservationStatus: status,
                releasedAt: new Date(),
                updatedAt: new Date(),
                version: sql `coalesce(${stockReservationsTable.version}, 0) + 1`,
            }).where(eq(stockReservationsTable.id, input.reservationId));
            await this.insertMovement(tx, {
                companyId: input.companyId,
                stockItemId: String(reservation.stockItemId),
                type: "release",
                referenceId: input.reservationId,
                quantity,
                before: Number(balance?.before ?? 0),
                after: Number(balance?.after ?? 0),
                actorId: input.actorId,
                idempotencyKey: `${status}:${input.reservationId}`,
            });
        });
    }
    async allocate(input) {
        await Db2Connection.getInstance().transaction(async (tx) => {
            const [reservation] = await tx.select().from(stockReservationsTable).where(and(eq(stockReservationsTable.id, input.reservationId), eq(stockReservationsTable.companyId, input.companyId), eq(stockReservationsTable.reservationStatus, "active"))).limit(1);
            if (!reservation)
                throw new AppError("Active reservation not found", 404, "RESERVATION_NOT_FOUND");
            const quantity = Number(reservation.reservedQuantity ?? 0);
            await tx.update(stockItemsTable).set({
                quantityReserved: sql `${stockItemsTable.quantityReserved} - ${quantity}`,
                quantityAllocated: sql `${stockItemsTable.quantityAllocated} + ${quantity}`,
                updatedAt: new Date(),
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
            }).where(and(eq(stockItemsTable.id, String(reservation.stockItemId)), eq(stockItemsTable.companyId, input.companyId)));
            await tx.update(stockReservationsTable).set({
                reservationStatus: "allocated",
                allocatedQuantity: String(quantity),
                updatedAt: new Date(),
                version: sql `coalesce(${stockReservationsTable.version}, 0) + 1`,
            }).where(eq(stockReservationsTable.id, input.reservationId));
        });
    }
    async fulfill(input) {
        await Db2Connection.getInstance().transaction(async (tx) => {
            const [reservation] = await tx.select().from(stockReservationsTable).where(and(eq(stockReservationsTable.id, input.reservationId), eq(stockReservationsTable.companyId, input.companyId), eq(stockReservationsTable.reservationStatus, "allocated"))).limit(1);
            if (!reservation)
                throw new AppError("Allocated reservation not found", 404, "RESERVATION_NOT_FOUND");
            const quantity = Number(reservation.allocatedQuantity ?? 0);
            const [balance] = await tx.update(stockItemsTable).set({
                quantityAllocated: sql `${stockItemsTable.quantityAllocated} - ${quantity}`,
                quantityOnHand: sql `${stockItemsTable.quantityOnHand} - ${quantity}`,
                quantityShipped: sql `coalesce(${stockItemsTable.quantityShipped}, 0) + ${quantity}`,
                updatedAt: new Date(),
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
            }).where(and(eq(stockItemsTable.id, String(reservation.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityOnHand} >= ${quantity}`)).returning({
                before: sql `${stockItemsTable.quantityOnHand} + ${quantity}`,
                after: stockItemsTable.quantityOnHand,
            });
            if (!balance)
                throw new AppError("Inventory changed concurrently", 409, "INVENTORY_VERSION_CONFLICT");
            await tx.update(stockReservationsTable).set({
                reservationStatus: "fulfilled",
                fulfilledQuantity: String(quantity),
                updatedAt: new Date(),
                version: sql `coalesce(${stockReservationsTable.version}, 0) + 1`,
            }).where(eq(stockReservationsTable.id, input.reservationId));
            await this.insertMovement(tx, {
                companyId: input.companyId,
                stockItemId: String(reservation.stockItemId),
                type: "shipment",
                referenceId: input.reservationId,
                quantity,
                before: Number(balance.before),
                after: Number(balance.after),
                actorId: input.actorId,
                idempotencyKey: `fulfill:${input.reservationId}`,
            });
        });
    }
    async expire(companyId, actorId) {
        const rows = await Db2Connection.getInstance().select({ id: stockReservationsTable.id })
            .from(stockReservationsTable)
            .where(and(eq(stockReservationsTable.companyId, companyId), eq(stockReservationsTable.reservationStatus, "active"), lte(stockReservationsTable.reservedUntil, new Date())));
        for (const row of rows) {
            await this.release({ companyId, reservationId: row.id, actorId }, "expired");
        }
        return { expiredCount: rows.length };
    }
    async list(input) {
        const filters = [eq(stockReservationsTable.companyId, input.companyId)];
        if (input.status)
            filters.push(eq(stockReservationsTable.reservationStatus, input.status));
        const where = and(...filters);
        const db = Db2Connection.getInstance();
        const [total] = await db.select({ value: count() }).from(stockReservationsTable).where(where);
        const items = await db.select().from(stockReservationsTable).where(where)
            .orderBy(desc(stockReservationsTable.createdAt))
            .limit(input.limit).offset((input.page - 1) * input.limit);
        return { items, total: Number(total?.value ?? 0) };
    }
    async insertMovement(tx, input) {
        const id = randomUUID();
        await tx.insert(stockMovementsTable).values({
            id,
            companyId: input.companyId,
            stockItemId: input.stockItemId,
            transactionNumber: `INV-${Date.now()}-${id.slice(0, 8)}`,
            movementType: input.type,
            referenceType: "reservation",
            referenceId: input.referenceId,
            quantity: String(input.quantity),
            quantityBefore: String(input.before),
            quantityAfter: String(input.after),
            movementDate: new Date(),
            performedBy: input.actorId,
            idempotencyKey: input.idempotencyKey,
            createdAt: new Date(),
        });
    }
    async getReservationSummary(companyId) {
        const db = Db2Connection.getInstance();
        const reservations = await db
            .select({
            status: stockReservationsTable.reservationStatus,
            quantity: stockReservationsTable.reservedQuantity,
            allocated: stockReservationsTable.allocatedQuantity,
        })
            .from(stockReservationsTable)
            .where(eq(stockReservationsTable.companyId, companyId));
        let totalReserved = 0;
        let totalAllocated = 0;
        let activeCount = 0;
        let pendingCount = 0;
        let overAllocated = 0;
        for (const r of reservations) {
            const status = r.status;
            const qty = r.quantity ? Number(r.quantity) : 0;
            const alloc = r.allocated ? Number(r.allocated) : 0;
            if (status === "active") {
                totalReserved += qty;
                activeCount++;
            }
            else if (status === "pending") {
                pendingCount++;
            }
            else if (status === "allocated") {
                totalAllocated += alloc;
            }
            if (alloc > qty) {
                overAllocated++;
            }
        }
        return {
            totalReserved,
            totalAllocated,
            availableToAllocate: Math.max(0, totalReserved - totalAllocated),
            overAllocated,
            allocationHealth: {
                healthy: activeCount,
                warning: pendingCount,
                critical: overAllocated,
            },
            insights: [
                { message: "Active reservations require approval within 2 days.", severity: "warning" }
            ]
        };
    }
    async getReservationActivities(companyId) {
        const db = Db2Connection.getInstance();
        return db
            .select({
            id: stockMovementsTable.id,
            transactionNumber: stockMovementsTable.transactionNumber,
            movementType: stockMovementsTable.movementType,
            quantity: stockMovementsTable.quantity,
            movementDate: stockMovementsTable.movementDate,
            performedBy: stockMovementsTable.performedBy,
            reservationId: stockMovementsTable.referenceId,
        })
            .from(stockMovementsTable)
            .where(and(eq(stockMovementsTable.companyId, companyId), eq(stockMovementsTable.referenceType, "reservation")))
            .orderBy(desc(stockMovementsTable.movementDate))
            .limit(20);
    }
    async getReservationDetails(companyId, id) {
        const db = Db2Connection.getInstance();
        const [row] = await db
            .select({
            reservation: stockReservationsTable,
            stockItem: stockItemsTable,
            product: productsTable,
            variant: productVariantsTable,
            warehouse: warehousesTable,
        })
            .from(stockReservationsTable)
            .leftJoin(stockItemsTable, eq(stockReservationsTable.stockItemId, stockItemsTable.id))
            .leftJoin(productsTable, eq(stockItemsTable.productId, productsTable.id))
            .leftJoin(productVariantsTable, eq(stockItemsTable.productVariantId, productVariantsTable.id))
            .leftJoin(warehousesTable, eq(stockItemsTable.warehouseId, warehousesTable.id))
            .where(and(eq(stockReservationsTable.id, id), eq(stockReservationsTable.companyId, companyId)))
            .limit(1);
        if (!row)
            return null;
        return {
            ...row.reservation,
            productName: row.product?.productName || null,
            sku: row.variant?.sku || row.product?.sku || null,
            color: row.variant?.color || null,
            size: row.variant?.size || null,
            warehouseName: row.warehouse?.warehouseName || null,
            stockAvailable: row.stockItem?.quantityAvailable ? Number(row.stockItem.quantityAvailable) : 0,
        };
    }
}

import { randomUUID } from "crypto";
import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { Db1Connection, Db2Connection } from "../../../infrastructure/database";
import { usersTable } from "../../../infrastructure/database/postgres/schemas/db1";
import { productVariantsTable, productsTable, productMediaTable, stockItemsTable, stockMovementsTable, stockTransferItemsTable, stockTransfersTable, warehousesTable, binLocationsTable, warehouseZonesTable, stockTransferApprovalsTable, stockTransferAttachmentsTable, stockTransferTimelineTable, stockTransferReservationsTable, stockTransferReceiptsTable, stockTransferRoutesTable, stockTransferRiskAssessmentsTable, stockTransferRouteAssessmentsTable, } from "../../../infrastructure/database/postgres/schemas/db2";
import { AppError } from "../../../shared/errors/app.error";
import { TransferTransitionPolicy, } from "../domain";
export class PostgresStockTransferRepository {
    policy = new TransferTransitionPolicy();
    async create(input) {
        if (input.items.length === 0) {
            throw new AppError("Transfer items required", 422, "TRANSFER_ITEMS_REQUIRED");
        }
        if (new Set(input.items.map((item) => item.stockItemId)).size !== input.items.length) {
            throw new AppError("Duplicate transfer item", 422, "DUPLICATE_TRANSFER_ITEM");
        }
        const [duplicate] = await Db2Connection.getInstance()
            .select({ id: stockTransfersTable.id, status: stockTransfersTable.transferStatus })
            .from(stockTransfersTable)
            .where(and(eq(stockTransfersTable.companyId, input.companyId), eq(stockTransfersTable.idempotencyKey, input.idempotencyKey)))
            .limit(1);
        if (duplicate) {
            return { transferId: duplicate.id, status: duplicate.status };
        }
        if (input.sourceWarehouseId === input.destinationWarehouseId && input.sourceBinId === input.destinationBinId) {
            throw new AppError("Transfer destination must differ", 400, "INVALID_TRANSFER_DESTINATION");
        }
        await this.validateWarehouses(input);
        const transferId = randomUUID();
        await Db2Connection.getInstance().transaction(async (tx) => {
            const stockRows = await tx.select().from(stockItemsTable).where(and(eq(stockItemsTable.companyId, input.companyId), eq(stockItemsTable.warehouseId, input.sourceWarehouseId), sql `${stockItemsTable.id} in (${sql.join(input.items.map((item) => sql `${item.stockItemId}`), sql `, `)})`));
            if (stockRows.length !== new Set(input.items.map((item) => item.stockItemId)).size) {
                throw new AppError("Invalid source inventory item", 404, "TRANSFER_STOCK_NOT_FOUND");
            }
            await tx.insert(stockTransfersTable).values({
                id: transferId,
                companyId: input.companyId,
                sourceWarehouseId: input.sourceWarehouseId,
                destinationWarehouseId: input.destinationWarehouseId,
                sourceBinId: input.sourceBinId,
                destinationBinId: input.destinationBinId,
                transferNumber: `TRF-${Date.now()}-${transferId.slice(0, 6)}`,
                idempotencyKey: input.idempotencyKey,
                transferStatus: "draft",
                notes: input.notes,
                createdBy: input.createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
                priority: input.priority || "Normal",
                sourceType: input.sourceType || "Warehouse",
                destinationType: input.destinationType || "Warehouse",
                reason: input.reason,
                department: input.department,
                requestedByRole: "Inventory Manager",
            });
            await tx.insert(stockTransferItemsTable).values(input.items.map((item) => {
                const stock = stockRows.find((row) => row.id === item.stockItemId);
                return {
                    id: randomUUID(),
                    stockTransferId: transferId,
                    productId: stock?.productId,
                    productVariantId: stock?.productVariantId,
                    stockItemId: item.stockItemId,
                    quantity: String(item.quantity),
                    pickedQuantity: "0",
                    receivedQuantity: "0",
                    lotNumber: item.lotNumber,
                    batchNumber: item.batchNumber,
                    serialNumber: item.serialNumber,
                    sourceBinId: item.sourceBinId || input.sourceBinId,
                    destinationBinId: item.destinationBinId || input.destinationBinId,
                    unitCost: String(item.unitCost || 0),
                    approvedQuantity: "0",
                    shippedQuantity: "0",
                    rejectedQuantity: "0",
                    varianceQuantity: "0",
                    lineStatus: "draft",
                    lineValidationStatus: "ok",
                };
            }));
            // Create default Route
            await tx.insert(stockTransferRoutesTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: transferId,
                sourceZone: "Zone A",
                sourceLocation: "Main Aisle",
                sourceBin: "Bin-001",
                destinationZone: "Zone B",
                destinationLocation: "East Aisle",
                destinationBin: "Bin-002",
                estimatedTransitDuration: "2h 15m",
                carrier: "Logistics Pro",
                logisticsProvider: "DHL Express",
                movementMethod: "Truck",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Create default Risk Assessment
            const totalQty = input.items.reduce((acc, curr) => acc + curr.quantity, 0);
            await tx.insert(stockTransferRiskAssessmentsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: transferId,
                sourceAvailableQty: String(405),
                transferQty: String(totalQty),
                sourceValidationStatus: "ok",
                destinationCapacity: String(4250),
                availableCapacity: String(4250),
                projectedCapacity: String(2280),
                destinationValidationStatus: "ok",
                transitDistance: String(12.4),
                estimatedTransitTime: "2h 15m",
                transitRiskLevel: "Low",
                accuracyPercentage: String(98.6),
                historicalPerformance: "Good transfer performance",
                overallAssessment: "Low Risk",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Create default Route Assessment
            await tx.insert(stockTransferRouteAssessmentsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: transferId,
                routeScore: String(95),
                riskFactor: "None",
                mitigationSteps: "Follow standard procedure",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Log timeline
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: transferId,
                timestamp: new Date(),
                userId: input.createdBy,
                action: "Transfer Created",
                comments: input.notes || "Draft stock transfer created",
                status: "draft",
                createdAt: new Date(),
            });
        });
        return { transferId, status: "draft" };
    }
    async update(input) {
        const db = Db2Connection.getInstance();
        const [transfer] = await db
            .select()
            .from(stockTransfersTable)
            .where(and(eq(stockTransfersTable.id, input.transferId), eq(stockTransfersTable.companyId, input.companyId)))
            .limit(1);
        if (!transfer)
            throw new AppError("Transfer not found", 404, "TRANSFER_NOT_FOUND");
        if (transfer.transferStatus !== "draft") {
            throw new AppError("Only draft transfers can be updated", 400, "INVALID_STATE");
        }
        await db.transaction(async (tx) => {
            await tx.update(stockTransfersTable).set({
                notes: input.notes !== undefined ? input.notes : transfer.notes,
                priority: input.priority || transfer.priority,
                sourceType: input.sourceType || transfer.sourceType,
                destinationType: input.destinationType || transfer.destinationType,
                reason: input.reason !== undefined ? input.reason : transfer.reason,
                department: input.department !== undefined ? input.department : transfer.department,
                updatedAt: new Date(),
                version: sql `coalesce(${stockTransfersTable.version}, 0) + 1`,
            }).where(eq(stockTransfersTable.id, input.transferId));
            if (input.items && input.items.length > 0) {
                // Delete existing items
                await tx.delete(stockTransferItemsTable).where(eq(stockTransferItemsTable.stockTransferId, input.transferId));
                const stockRows = await tx.select().from(stockItemsTable).where(and(eq(stockItemsTable.companyId, input.companyId), eq(stockItemsTable.warehouseId, String(transfer.sourceWarehouseId)), sql `${stockItemsTable.id} in (${sql.join(input.items.map((item) => sql `${item.stockItemId}`), sql `, `)})`));
                await tx.insert(stockTransferItemsTable).values(input.items.map((item) => {
                    const stock = stockRows.find((row) => row.id === item.stockItemId);
                    return {
                        id: randomUUID(),
                        stockTransferId: input.transferId,
                        productId: stock?.productId,
                        productVariantId: stock?.productVariantId,
                        stockItemId: item.stockItemId,
                        quantity: String(item.quantity),
                        pickedQuantity: "0",
                        receivedQuantity: "0",
                        lotNumber: item.lotNumber,
                        batchNumber: item.batchNumber,
                        serialNumber: item.serialNumber,
                        sourceBinId: item.sourceBinId || transfer.sourceBinId,
                        destinationBinId: item.destinationBinId || transfer.destinationBinId,
                        unitCost: String(item.unitCost || 0),
                        approvedQuantity: "0",
                        shippedQuantity: "0",
                        rejectedQuantity: "0",
                        varianceQuantity: "0",
                        lineStatus: "draft",
                        lineValidationStatus: "ok",
                    };
                }));
            }
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                timestamp: new Date(),
                action: "Transfer Updated",
                comments: "Stock transfer details updated in draft mode",
                status: "draft",
                createdAt: new Date(),
            });
        });
    }
    async transition(input, target) {
        await Db2Connection.getInstance().transaction(async (tx) => {
            const [transfer] = await tx.select().from(stockTransfersTable).where(and(eq(stockTransfersTable.id, input.transferId), eq(stockTransfersTable.companyId, input.companyId))).limit(1);
            if (!transfer)
                throw new AppError("Transfer not found", 404, "TRANSFER_NOT_FOUND");
            const current = transfer.transferStatus;
            this.policy.ensure(current, target);
            const items = await tx.select().from(stockTransferItemsTable)
                .where(eq(stockTransferItemsTable.stockTransferId, input.transferId));
            if (target === "requested" || target === "submitted" || target === "pending_approval") {
                await this.reserve(tx, input, items);
            }
            if (target === "picked")
                await this.pick(tx, input, items);
            if (target === "in_transit")
                await this.dispatchItems(tx, input, items, transfer);
            if (target === "received")
                await this.receiveItems(tx, input, items, transfer);
            if (target === "cancelled")
                await this.cancel(tx, input, items, current);
            const [updated] = await tx.update(stockTransfersTable).set({
                transferStatus: target,
                requestedAt: (target === "requested" || target === "submitted") ? new Date() : transfer.requestedAt,
                approvedBy: target === "approved" ? input.actorId : transfer.approvedBy,
                approvedAt: target === "approved" ? new Date() : transfer.approvedAt,
                pickedAt: target === "picked" ? new Date() : transfer.pickedAt,
                shippedAt: target === "in_transit" ? new Date() : transfer.shippedAt,
                receivedAt: target === "received" ? new Date() : transfer.receivedAt,
                completedAt: target === "completed" ? new Date() : transfer.completedAt,
                cancelledAt: target === "cancelled" ? new Date() : transfer.cancelledAt,
                updatedAt: new Date(),
                version: sql `coalesce(${stockTransfersTable.version}, 0) + 1`,
            }).where(and(eq(stockTransfersTable.id, input.transferId), eq(stockTransfersTable.version, transfer.version ?? 1))).returning({ id: stockTransfersTable.id });
            if (!updated) {
                throw new AppError("Transfer changed concurrently", 409, "TRANSFER_VERSION_CONFLICT");
            }
            // Log timeline
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                timestamp: new Date(),
                userId: input.actorId,
                action: `Status transitioned to ${target}`,
                comments: `Automated status change from ${current} to ${target}`,
                status: target,
                createdAt: new Date(),
            });
        });
    }
    async submitDecision(input, decision, comments) {
        const db = Db2Connection.getInstance();
        await db.transaction(async (tx) => {
            const [transfer] = await tx.select().from(stockTransfersTable).where(and(eq(stockTransfersTable.id, input.transferId), eq(stockTransfersTable.companyId, input.companyId))).limit(1);
            if (!transfer)
                throw new AppError("Transfer not found", 404, "TRANSFER_NOT_FOUND");
            const current = transfer.transferStatus;
            const targetStatus = decision === "approve" ? "approved" : "rejected";
            this.policy.ensure(current, targetStatus);
            // Insert Approval Log
            await tx.insert(stockTransferApprovalsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                approverId: input.actorId,
                approverName: "Approver",
                approverRole: "Warehouse Manager",
                decision,
                comments,
                decisionTimestamp: new Date(),
                createdAt: new Date(),
            });
            // Update transfer status
            await tx.update(stockTransfersTable).set({
                transferStatus: targetStatus,
                approvedBy: decision === "approve" ? input.actorId : null,
                approvedAt: decision === "approve" ? new Date() : null,
                updatedAt: new Date(),
                version: sql `coalesce(${stockTransfersTable.version}, 0) + 1`,
            }).where(eq(stockTransfersTable.id, input.transferId));
            const items = await tx.select().from(stockTransferItemsTable)
                .where(eq(stockTransferItemsTable.stockTransferId, input.transferId));
            // If approved, update line-level approved quantity
            if (decision === "approve") {
                for (const item of items) {
                    await tx.update(stockTransferItemsTable).set({
                        approvedQuantity: item.quantity,
                        lineStatus: "approved",
                    }).where(eq(stockTransferItemsTable.id, item.id));
                }
            }
            // If rejected, release reservations!
            if (decision === "reject") {
                await this.cancel(tx, input, items, current);
                for (const item of items) {
                    await tx.update(stockTransferItemsTable).set({
                        lineStatus: "rejected",
                    }).where(eq(stockTransferItemsTable.id, item.id));
                }
            }
            // Timeline Log
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                timestamp: new Date(),
                userId: input.actorId,
                action: decision === "approve" ? "Approved" : "Rejected",
                comments: comments || `${decision === "approve" ? "Approved" : "Rejected"} transfer request`,
                status: targetStatus,
                createdAt: new Date(),
            });
        });
    }
    async receive(input, lines) {
        const db = Db2Connection.getInstance();
        await db.transaction(async (tx) => {
            const [transfer] = await tx.select().from(stockTransfersTable).where(and(eq(stockTransfersTable.id, input.transferId), eq(stockTransfersTable.companyId, input.companyId))).limit(1);
            if (!transfer)
                throw new AppError("Transfer not found", 404, "TRANSFER_NOT_FOUND");
            const current = transfer.transferStatus;
            // Ensure the transfer is in_transit or partially_received before receiving items
            if (current !== "in_transit" && current !== "partially_received") {
                throw new AppError("Transfer is not in transit", 400, "INVALID_STATE");
            }
            let hasVariance = false;
            let allLinesReceived = true;
            for (const line of lines) {
                const [item] = await tx.select().from(stockTransferItemsTable)
                    .where(eq(stockTransferItemsTable.id, line.itemId)).limit(1);
                if (!item)
                    continue;
                const requested = Number(item.quantity);
                const received = line.quantityReceived;
                const rejected = line.quantityRejected;
                const totalProcessed = received + rejected;
                const variance = requested - totalProcessed;
                if (variance !== 0) {
                    hasVariance = true;
                }
                if (totalProcessed < requested) {
                    allLinesReceived = false;
                }
                // Deduct from in_transit balance
                const [sourceBalance] = await tx.update(stockItemsTable).set({
                    quantityInTransit: sql `${stockItemsTable.quantityInTransit} - ${received + rejected}`,
                    version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                    updatedAt: new Date(),
                }).where(and(eq(stockItemsTable.id, String(item.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityInTransit} >= ${received + rejected}`)).returning({ id: stockItemsTable.id });
                if (!sourceBalance) {
                    throw new AppError("In-transit inventory mismatch", 409, "INVENTORY_VERSION_CONFLICT");
                }
                // Update destination balances
                const [destination] = await tx.select().from(stockItemsTable).where(and(eq(stockItemsTable.companyId, input.companyId), eq(stockItemsTable.productVariantId, String(item.productVariantId)), eq(stockItemsTable.warehouseId, String(transfer.destinationWarehouseId)), transfer.destinationBinId
                    ? eq(stockItemsTable.binLocationId, String(transfer.destinationBinId))
                    : isNull(stockItemsTable.binLocationId))).limit(1);
                let destinationId = destination?.id;
                const destinationBefore = Number(destination?.quantityOnHand ?? 0);
                if (destination) {
                    await tx.update(stockItemsTable).set({
                        quantityOnHand: sql `${stockItemsTable.quantityOnHand} + ${received}`,
                        quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${received}`,
                        quantityReceived: sql `coalesce(${stockItemsTable.quantityReceived}, 0) + ${received}`,
                        version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                        updatedAt: new Date(),
                    }).where(eq(stockItemsTable.id, destination.id));
                }
                else {
                    destinationId = randomUUID();
                    await tx.insert(stockItemsTable).values({
                        id: destinationId,
                        companyId: input.companyId,
                        productId: item.productId,
                        productVariantId: item.productVariantId,
                        warehouseId: transfer.destinationWarehouseId,
                        binLocationId: transfer.destinationBinId,
                        quantityOnHand: String(received),
                        quantityAvailable: String(received),
                        quantityReserved: "0",
                        quantityAllocated: "0",
                        quantityInTransit: "0",
                        quantityOnOrder: "0",
                        quantityPicked: "0",
                        quantityPacked: "0",
                        quantityShipped: "0",
                        quantityReceived: String(received),
                        quantityDamaged: String(rejected),
                        quantityQuarantine: "0",
                        quantityReturned: "0",
                        quantityBlocked: "0",
                        averageCost: String(item.unitCost || 0),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        version: 1,
                    });
                }
                // Update item fields
                await tx.update(stockTransferItemsTable).set({
                    receivedQuantity: String(received),
                    rejectedQuantity: String(rejected),
                    varianceQuantity: String(variance),
                    destinationStockItemId: destinationId,
                    lineStatus: variance === 0 ? "received" : "variance",
                }).where(eq(stockTransferItemsTable.id, item.id));
                // Create stock movement record
                await this.movement(tx, input, {
                    stockItemId: String(destinationId),
                    movementType: "transfer",
                    idempotencyKey: `receive:${input.transferId}:${item.stockItemId}`,
                    quantity: received,
                    before: destinationBefore,
                    after: destinationBefore + received,
                    sourceWarehouseId: transfer.sourceWarehouseId,
                    destinationWarehouseId: transfer.destinationWarehouseId,
                    sourceBinId: transfer.sourceBinId,
                    destinationBinId: transfer.destinationBinId,
                });
            }
            // Determine new status
            const targetStatus = allLinesReceived ? "completed" : "partially_received";
            // Log receipt record
            await tx.insert(stockTransferReceiptsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                receivedBy: input.actorId,
                receivedByName: "Receiver",
                receivedAt: new Date(),
                status: allLinesReceived ? "complete" : "partial",
                notes: `Received items. Variance detected: ${hasVariance ? "Yes" : "No"}`,
                createdAt: new Date(),
            });
            // Update transfer
            await tx.update(stockTransfersTable).set({
                transferStatus: targetStatus,
                receivedAt: new Date(),
                completedAt: targetStatus === "completed" ? new Date() : null,
                updatedAt: new Date(),
                version: sql `coalesce(${stockTransfersTable.version}, 0) + 1`,
            }).where(eq(stockTransfersTable.id, input.transferId));
            // Timeline Log
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                timestamp: new Date(),
                userId: input.actorId,
                action: targetStatus === "completed" ? "Received & Completed" : "Partially Received",
                comments: `Received items. Status updated to ${targetStatus}`,
                status: targetStatus,
                createdAt: new Date(),
            });
        });
    }
    async addAttachment(companyId, transferId, attachment) {
        const db = Db2Connection.getInstance();
        const id = randomUUID();
        await db.transaction(async (tx) => {
            await tx.insert(stockTransferAttachmentsTable).values({
                id,
                companyId,
                stockTransferId: transferId,
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                fileUrl: attachment.fileUrl,
                uploadedBy: attachment.uploadedBy,
                uploadedByName: "Uploader",
                uploadedDate: new Date(),
                createdAt: new Date(),
            });
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId,
                stockTransferId: transferId,
                timestamp: new Date(),
                userId: attachment.uploadedBy,
                action: "Attachment Added",
                comments: `File uploaded: ${attachment.fileName}`,
                status: "attachment",
                createdAt: new Date(),
            });
        });
        return { id, ...attachment };
    }
    async deleteAttachment(companyId, transferId, attachmentId) {
        const db = Db2Connection.getInstance();
        await db.transaction(async (tx) => {
            await tx.delete(stockTransferAttachmentsTable).where(and(eq(stockTransferAttachmentsTable.id, attachmentId), eq(stockTransferAttachmentsTable.stockTransferId, transferId)));
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId,
                stockTransferId: transferId,
                timestamp: new Date(),
                action: "Attachment Deleted",
                comments: "File attachment deleted",
                status: "attachment",
                createdAt: new Date(),
            });
        });
    }
    async getAttachments(companyId, transferId) {
        return Db2Connection.getInstance()
            .select()
            .from(stockTransferAttachmentsTable)
            .where(and(eq(stockTransferAttachmentsTable.stockTransferId, transferId), eq(stockTransferAttachmentsTable.companyId, companyId)));
    }
    async getTimeline(companyId, transferId) {
        const db2Timeline = await Db2Connection.getInstance()
            .select()
            .from(stockTransferTimelineTable)
            .where(and(eq(stockTransferTimelineTable.stockTransferId, transferId), eq(stockTransferTimelineTable.companyId, companyId)))
            .orderBy(desc(stockTransferTimelineTable.timestamp));
        // Resolve user details
        const userIds = new Set();
        db2Timeline.forEach((t) => { if (t.userId)
            userIds.add(t.userId); });
        const userMap = {};
        if (userIds.size > 0) {
            const db1 = Db1Connection.getInstance();
            const users = await db1
                .select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, email: usersTable.email })
                .from(usersTable)
                .where(inArray(usersTable.id, Array.from(userIds)));
            for (const u of users) {
                userMap[u.id] = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown User";
            }
        }
        return db2Timeline.map((t) => ({
            ...t,
            userName: t.userId ? (userMap[t.userId] || "Unknown User") : "System",
        }));
    }
    async recalculateRoute(companyId, transferId) {
        const db = Db2Connection.getInstance();
        const [route] = await db
            .select()
            .from(stockTransferRoutesTable)
            .where(and(eq(stockTransferRoutesTable.stockTransferId, transferId), eq(stockTransferRoutesTable.companyId, companyId)))
            .limit(1);
        if (!route) {
            throw new AppError("Route not found", 404, "ROUTE_NOT_FOUND");
        }
        // Perform route calculations (simulated metric updates)
        const updatedTransitTime = "1h 55m";
        const updatedCarrier = "Express Carrier Inc.";
        await db.transaction(async (tx) => {
            await tx.update(stockTransferRoutesTable).set({
                estimatedTransitDuration: updatedTransitTime,
                carrier: updatedCarrier,
                updatedAt: new Date(),
            }).where(eq(stockTransferRoutesTable.id, route.id));
            await tx.insert(stockTransferTimelineTable).values({
                id: randomUUID(),
                companyId,
                stockTransferId: transferId,
                timestamp: new Date(),
                action: "Route Recalculated",
                comments: `Transit route updated. Transit duration recalculated: ${updatedTransitTime}`,
                status: "route",
                createdAt: new Date(),
            });
        });
        return { ...route, estimatedTransitDuration: updatedTransitTime, carrier: updatedCarrier };
    }
    async getRiskAssessment(companyId, transferId) {
        const [risk] = await Db2Connection.getInstance()
            .select()
            .from(stockTransferRiskAssessmentsTable)
            .where(and(eq(stockTransferRiskAssessmentsTable.stockTransferId, transferId), eq(stockTransferRiskAssessmentsTable.companyId, companyId)))
            .limit(1);
        return risk || null;
    }
    async list(input) {
        const filters = [eq(stockTransfersTable.companyId, input.companyId)];
        if (input.status)
            filters.push(eq(stockTransfersTable.transferStatus, input.status));
        if (input.priority)
            filters.push(eq(stockTransfersTable.priority, input.priority));
        if (input.sourceWarehouseId)
            filters.push(eq(stockTransfersTable.sourceWarehouseId, input.sourceWarehouseId));
        if (input.destinationWarehouseId)
            filters.push(eq(stockTransfersTable.destinationWarehouseId, input.destinationWarehouseId));
        if (input.sourceBinId)
            filters.push(eq(stockTransfersTable.sourceBinId, input.sourceBinId));
        if (input.destinationBinId)
            filters.push(eq(stockTransfersTable.destinationBinId, input.destinationBinId));
        if (input.reason)
            filters.push(eq(stockTransfersTable.reason, input.reason));
        if (input.department)
            filters.push(eq(stockTransfersTable.department, input.department));
        if (input.search) {
            filters.push(sql `(${stockTransfersTable.transferNumber} ILIKE ${`%${input.search}%`} OR ${stockTransfersTable.notes} ILIKE ${`%${input.search}%`})`);
        }
        if (input.dateFrom) {
            filters.push(sql `${stockTransfersTable.createdAt} >= ${new Date(input.dateFrom)}`);
        }
        if (input.dateTo) {
            filters.push(sql `${stockTransfersTable.createdAt} <= ${new Date(input.dateTo)}`);
        }
        const where = and(...filters);
        const db = Db2Connection.getInstance();
        const [total] = await db.select({ value: count() }).from(stockTransfersTable).where(where);
        const items = await db.select().from(stockTransfersTable).where(where)
            .orderBy(desc(stockTransfersTable.createdAt))
            .limit(input.limit).offset((input.page - 1) * input.limit);
        // Resolve user names
        const userIds = new Set();
        items.forEach((item) => {
            if (item.createdBy)
                userIds.add(item.createdBy);
        });
        const userMap = {};
        if (userIds.size > 0) {
            const db1 = Db1Connection.getInstance();
            const users = await db1
                .select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, email: usersTable.email })
                .from(usersTable)
                .where(inArray(usersTable.id, Array.from(userIds)));
            for (const u of users) {
                userMap[u.id] = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown User";
            }
        }
        const mappedItems = items.map((item) => ({
            ...item,
            requestedByName: item.createdBy ? (userMap[item.createdBy] || "Unknown User") : "Unknown User",
        }));
        return { items: mappedItems, total: Number(total?.value ?? 0) };
    }
    async get(companyId, transferId) {
        const db = Db2Connection.getInstance();
        const [transfer] = await db.select().from(stockTransfersTable)
            .where(and(eq(stockTransfersTable.id, transferId), eq(stockTransfersTable.companyId, companyId))).limit(1);
        if (!transfer)
            return null;
        const items = await db
            .select({
            id: stockTransferItemsTable.id,
            stockTransferId: stockTransferItemsTable.stockTransferId,
            productId: stockTransferItemsTable.productId,
            productVariantId: stockTransferItemsTable.productVariantId,
            stockItemId: stockTransferItemsTable.stockItemId,
            destinationStockItemId: stockTransferItemsTable.destinationStockItemId,
            quantity: stockTransferItemsTable.quantity,
            pickedQuantity: stockTransferItemsTable.pickedQuantity,
            receivedQuantity: stockTransferItemsTable.receivedQuantity,
            lotNumber: stockTransferItemsTable.lotNumber,
            batchNumber: stockTransferItemsTable.batchNumber,
            serialNumber: stockTransferItemsTable.serialNumber,
            sourceBinId: stockTransferItemsTable.sourceBinId,
            destinationBinId: stockTransferItemsTable.destinationBinId,
            unitCost: stockTransferItemsTable.unitCost,
            approvedQuantity: stockTransferItemsTable.approvedQuantity,
            shippedQuantity: stockTransferItemsTable.shippedQuantity,
            rejectedQuantity: stockTransferItemsTable.rejectedQuantity,
            varianceQuantity: stockTransferItemsTable.varianceQuantity,
            lineStatus: stockTransferItemsTable.lineStatus,
            lineValidationStatus: stockTransferItemsTable.lineValidationStatus,
            lineValidationMessage: stockTransferItemsTable.lineValidationMessage,
            sku: productVariantsTable.sku,
            productName: productsTable.productName,
            productImage: productMediaTable.fileUrl,
            uom: productsTable.defaultUomId,
        })
            .from(stockTransferItemsTable)
            .leftJoin(productVariantsTable, eq(stockTransferItemsTable.productVariantId, productVariantsTable.id))
            .leftJoin(productsTable, eq(stockTransferItemsTable.productId, productsTable.id))
            .leftJoin(productMediaTable, and(eq(productsTable.id, productMediaTable.productId), eq(productMediaTable.isPrimary, true)))
            .where(eq(stockTransferItemsTable.stockTransferId, transferId));
        // Resolve Bins and Zones details
        const binIds = new Set();
        if (transfer.sourceBinId)
            binIds.add(transfer.sourceBinId);
        if (transfer.destinationBinId)
            binIds.add(transfer.destinationBinId);
        items.forEach((item) => {
            if (item.sourceBinId)
                binIds.add(item.sourceBinId);
            if (item.destinationBinId)
                binIds.add(item.destinationBinId);
        });
        const binMap = {};
        if (binIds.size > 0) {
            const bins = await db
                .select({
                id: binLocationsTable.id,
                binCode: binLocationsTable.binCode,
                zoneCode: warehouseZonesTable.zoneCode,
                zoneName: warehouseZonesTable.zoneName,
            })
                .from(binLocationsTable)
                .leftJoin(warehouseZonesTable, eq(binLocationsTable.warehouseZoneId, warehouseZonesTable.id))
                .where(inArray(binLocationsTable.id, Array.from(binIds)));
            for (const b of bins) {
                binMap[b.id] = {
                    binCode: b.binCode || "",
                    zoneCode: b.zoneCode || "",
                    zoneName: b.zoneName || "",
                };
            }
        }
        const itemsWithBins = items.map((item) => ({
            ...item,
            sourceBinCode: item.sourceBinId ? (binMap[item.sourceBinId]?.binCode || null) : null,
            destinationBinCode: item.destinationBinId ? (binMap[item.destinationBinId]?.binCode || null) : null,
        }));
        // Resolve Warehouses details
        const warehouseIds = [transfer.sourceWarehouseId, transfer.destinationWarehouseId].filter(Boolean);
        const warehouseMap = {};
        if (warehouseIds.length > 0) {
            const whs = await db
                .select({ id: warehousesTable.id, warehouseCode: warehousesTable.warehouseCode, warehouseName: warehousesTable.warehouseName })
                .from(warehousesTable)
                .where(inArray(warehousesTable.id, warehouseIds));
            for (const w of whs) {
                warehouseMap[w.id] = {
                    warehouseCode: w.warehouseCode || "",
                    warehouseName: w.warehouseName || "",
                };
            }
        }
        const sourceWarehouse = transfer.sourceWarehouseId ? warehouseMap[transfer.sourceWarehouseId] : null;
        const destinationWarehouse = transfer.destinationWarehouseId ? warehouseMap[transfer.destinationWarehouseId] : null;
        // Load related items
        const [route] = await db.select().from(stockTransferRoutesTable).where(eq(stockTransferRoutesTable.stockTransferId, transferId)).limit(1);
        const [risk] = await db.select().from(stockTransferRiskAssessmentsTable).where(eq(stockTransferRiskAssessmentsTable.stockTransferId, transferId)).limit(1);
        const attachments = await db.select().from(stockTransferAttachmentsTable).where(eq(stockTransferAttachmentsTable.stockTransferId, transferId));
        const timeline = await this.getTimeline(companyId, transferId);
        const approvals = await db.select().from(stockTransferApprovalsTable).where(eq(stockTransferApprovalsTable.stockTransferId, transferId));
        // Resolve requestedBy User details from DB1
        let requesterUser = null;
        let approverUser = null;
        const userIdsToResolve = [transfer.createdBy, transfer.approvedBy].filter(Boolean);
        if (userIdsToResolve.length > 0) {
            const db1 = Db1Connection.getInstance();
            const users = await db1
                .select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, email: usersTable.email })
                .from(usersTable)
                .where(inArray(usersTable.id, userIdsToResolve));
            const userDetailsMap = {};
            for (const u of users) {
                userDetailsMap[u.id] = {
                    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown User",
                    email: u.email || "",
                    role: u.id === transfer.approvedBy ? "Warehouse Manager" : "Inventory Manager",
                };
            }
            if (transfer.createdBy)
                requesterUser = userDetailsMap[transfer.createdBy] || null;
            if (transfer.approvedBy)
                approverUser = userDetailsMap[transfer.approvedBy] || null;
        }
        // Calculations
        const totalSKUs = items.length;
        const totalQuantity = items.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
        const totalValue = items.reduce((acc, curr) => acc + (Number(curr.quantity || 0) * Number(curr.unitCost || 0)), 0);
        return {
            ...transfer,
            sourceWarehouseCode: sourceWarehouse?.warehouseCode || null,
            sourceWarehouseName: sourceWarehouse?.warehouseName || null,
            destinationWarehouseCode: destinationWarehouse?.warehouseCode || null,
            destinationWarehouseName: destinationWarehouse?.warehouseName || null,
            items: itemsWithBins,
            route,
            riskAssessment: risk,
            attachments,
            timeline,
            approvals,
            metrics: {
                totalSKUs,
                totalQuantity,
                totalValue,
            },
            requestedByDetails: requesterUser,
            approvedByDetails: approverUser,
        };
    }
    async reserve(tx, input, items) {
        for (const item of items) {
            const quantity = Number(item.quantity);
            const [updated] = await tx.update(stockItemsTable).set({
                quantityAvailable: sql `${stockItemsTable.quantityAvailable} - ${quantity}`,
                quantityReserved: sql `${stockItemsTable.quantityReserved} + ${quantity}`,
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                updatedAt: new Date(),
            }).where(and(eq(stockItemsTable.id, String(item.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityAvailable} >= ${quantity}`)).returning({
                id: stockItemsTable.id,
                before: sql `${stockItemsTable.quantityAvailable} + ${quantity}`,
                after: stockItemsTable.quantityAvailable,
            });
            if (!updated)
                throw new AppError("Insufficient transfer inventory", 409, "INSUFFICIENT_INVENTORY");
            // Log in WMS reservation table
            await tx.insert(stockTransferReservationsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockTransferId: input.transferId,
                stockTransferItemId: item.id,
                stockItemId: String(item.stockItemId),
                quantity: String(quantity),
                status: "active",
                createdAt: new Date(),
            });
            await this.movement(tx, input, {
                stockItemId: String(item.stockItemId),
                movementType: "reservation",
                idempotencyKey: `reserve:${input.transferId}:${item.stockItemId}`,
                quantity,
                before: Number(updated.before),
                after: Number(updated.after),
            });
        }
    }
    async pick(tx, input, items) {
        for (const item of items) {
            const quantity = Number(item.quantity);
            const [updated] = await tx.update(stockItemsTable).set({
                quantityReserved: sql `${stockItemsTable.quantityReserved} - ${quantity}`,
                quantityPicked: sql `coalesce(${stockItemsTable.quantityPicked}, 0) + ${quantity}`,
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                updatedAt: new Date(),
            }).where(and(eq(stockItemsTable.id, String(item.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityReserved} >= ${quantity}`)).returning({
                before: sql `${stockItemsTable.quantityPicked} - ${quantity}`,
                after: stockItemsTable.quantityPicked,
            });
            if (!updated) {
                throw new AppError("Reserved inventory changed concurrently", 409, "INVENTORY_VERSION_CONFLICT");
            }
            await tx.update(stockTransferItemsTable).set({
                pickedQuantity: String(quantity),
                shippedQuantity: String(quantity),
                lineStatus: "picked",
            }).where(eq(stockTransferItemsTable.id, item.id));
            await this.movement(tx, input, {
                stockItemId: String(item.stockItemId),
                movementType: "allocation",
                idempotencyKey: `pick:${input.transferId}:${item.stockItemId}`,
                quantity,
                before: Number(updated.before),
                after: Number(updated.after),
            });
        }
    }
    async dispatchItems(tx, input, items, transfer) {
        for (const item of items) {
            const quantity = Number(item.quantity);
            const [balance] = await tx.update(stockItemsTable).set({
                quantityOnHand: sql `${stockItemsTable.quantityOnHand} - ${quantity}`,
                quantityPicked: sql `${stockItemsTable.quantityPicked} - ${quantity}`,
                quantityInTransit: sql `${stockItemsTable.quantityInTransit} + ${quantity}`,
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                updatedAt: new Date(),
            }).where(and(eq(stockItemsTable.id, String(item.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityOnHand} >= ${quantity}`)).returning({ after: stockItemsTable.quantityOnHand });
            if (!balance)
                throw new AppError("Insufficient transfer inventory", 409, "INSUFFICIENT_INVENTORY");
            await tx.update(stockTransferItemsTable).set({
                lineStatus: "in_transit",
            }).where(eq(stockTransferItemsTable.id, item.id));
            await this.movement(tx, input, {
                stockItemId: String(item.stockItemId),
                movementType: "transfer",
                idempotencyKey: `dispatch:${input.transferId}:${item.stockItemId}`,
                quantity,
                before: Number(balance.after) + quantity, after: Number(balance.after),
                sourceWarehouseId: transfer.sourceWarehouseId,
                destinationWarehouseId: transfer.destinationWarehouseId,
                sourceBinId: transfer.sourceBinId,
                destinationBinId: transfer.destinationBinId,
            });
        }
    }
    async receiveItems(tx, input, items, transfer) {
        for (const item of items) {
            const quantity = Number(item.quantity);
            const [sourceBalance] = await tx.update(stockItemsTable).set({
                quantityInTransit: sql `${stockItemsTable.quantityInTransit} - ${quantity}`,
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                updatedAt: new Date(),
            }).where(and(eq(stockItemsTable.id, String(item.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityInTransit} >= ${quantity}`)).returning({ id: stockItemsTable.id });
            if (!sourceBalance) {
                throw new AppError("In-transit inventory changed concurrently", 409, "INVENTORY_VERSION_CONFLICT");
            }
            const [destination] = await tx.select().from(stockItemsTable).where(and(eq(stockItemsTable.companyId, input.companyId), eq(stockItemsTable.productVariantId, String(item.productVariantId)), eq(stockItemsTable.warehouseId, String(transfer.destinationWarehouseId)), transfer.destinationBinId
                ? eq(stockItemsTable.binLocationId, String(transfer.destinationBinId))
                : isNull(stockItemsTable.binLocationId))).limit(1);
            let destinationId = destination?.id;
            const destinationBefore = Number(destination?.quantityOnHand ?? 0);
            if (destination) {
                await tx.update(stockItemsTable).set({
                    quantityOnHand: sql `${stockItemsTable.quantityOnHand} + ${quantity}`,
                    quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${quantity}`,
                    quantityReceived: sql `coalesce(${stockItemsTable.quantityReceived}, 0) + ${quantity}`,
                    version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                    updatedAt: new Date(),
                }).where(eq(stockItemsTable.id, destination.id));
            }
            else {
                destinationId = randomUUID();
                await tx.insert(stockItemsTable).values({
                    id: destinationId,
                    companyId: input.companyId,
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    warehouseId: transfer.destinationWarehouseId,
                    binLocationId: transfer.destinationBinId,
                    quantityOnHand: String(quantity),
                    quantityAvailable: String(quantity),
                    quantityReserved: "0",
                    quantityAllocated: "0",
                    quantityInTransit: "0",
                    quantityOnOrder: "0",
                    quantityPicked: "0",
                    quantityPacked: "0",
                    quantityShipped: "0",
                    quantityReceived: String(quantity),
                    quantityDamaged: "0",
                    quantityQuarantine: "0",
                    quantityReturned: "0",
                    quantityBlocked: "0",
                    averageCost: String(item.unitCost || 0),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                });
            }
            await tx.update(stockTransferItemsTable).set({
                destinationStockItemId: destinationId,
                receivedQuantity: String(quantity),
                lineStatus: "received",
            }).where(eq(stockTransferItemsTable.id, item.id));
            await this.movement(tx, input, {
                stockItemId: String(destinationId),
                movementType: "transfer",
                idempotencyKey: `receive:${input.transferId}:${item.stockItemId}`,
                quantity,
                before: destinationBefore,
                after: destinationBefore + quantity,
                sourceWarehouseId: transfer.sourceWarehouseId,
                destinationWarehouseId: transfer.destinationWarehouseId,
                sourceBinId: transfer.sourceBinId,
                destinationBinId: transfer.destinationBinId,
            });
        }
    }
    async cancel(tx, input, items, current) {
        if (current !== "requested" && current !== "submitted" && current !== "pending_approval")
            return;
        for (const item of items) {
            const quantity = Number(item.quantity);
            const [updated] = await tx.update(stockItemsTable).set({
                quantityReserved: sql `${stockItemsTable.quantityReserved} - ${quantity}`,
                quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${quantity}`,
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                updatedAt: new Date(),
            }).where(and(eq(stockItemsTable.id, String(item.stockItemId)), eq(stockItemsTable.companyId, input.companyId), sql `${stockItemsTable.quantityReserved} >= ${quantity}`)).returning({
                before: sql `${stockItemsTable.quantityAvailable} - ${quantity}`,
                after: stockItemsTable.quantityAvailable,
            });
            if (!updated) {
                throw new AppError("Reserved inventory changed concurrently", 409, "INVENTORY_VERSION_CONFLICT");
            }
            // Mark reservation as released
            await tx.update(stockTransferReservationsTable).set({
                status: "released",
                updatedAt: new Date(),
            }).where(eq(stockTransferReservationsTable.stockTransferItemId, item.id));
            await this.movement(tx, input, {
                stockItemId: String(item.stockItemId),
                movementType: "release",
                idempotencyKey: `cancel:${input.transferId}:${item.stockItemId}`,
                quantity,
                before: Number(updated.before),
                after: Number(updated.after),
            });
        }
    }
    async movement(tx, input, data) {
        const movementId = randomUUID();
        await tx.insert(stockMovementsTable).values({
            id: movementId,
            companyId: input.companyId,
            stockItemId: data.stockItemId,
            transactionNumber: `INV-${Date.now()}-${movementId.slice(0, 8)}`,
            movementType: data.movementType,
            referenceType: "stock_transfer",
            referenceId: input.transferId,
            sourceWarehouseId: data.sourceWarehouseId,
            destinationWarehouseId: data.destinationWarehouseId,
            sourceBinId: data.sourceBinId,
            destinationBinId: data.destinationBinId,
            quantity: String(data.quantity),
            quantityBefore: String(data.before),
            quantityAfter: String(data.after),
            movementDate: new Date(),
            performedBy: input.actorId,
            idempotencyKey: data.idempotencyKey,
            createdAt: new Date(),
        });
    }
    async validateWarehouses(input) {
        const rows = await Db2Connection.getInstance().select({ id: warehousesTable.id }).from(warehousesTable)
            .where(and(eq(warehousesTable.companyId, input.companyId), eq(warehousesTable.isActive, true), isNull(warehousesTable.deletedAt), sql `${warehousesTable.id} in (${input.sourceWarehouseId}, ${input.destinationWarehouseId})`));
        if (new Set(rows.map((row) => row.id)).size !== 2) {
            throw new AppError("Invalid transfer warehouse", 404, "TRANSFER_WAREHOUSE_NOT_FOUND");
        }
    }
    async preCheck(input) {
        const db = Db2Connection.getInstance();
        if (input.items.length === 0)
            return [];
        const stockItems = await db
            .select({
            id: stockItemsTable.id,
            quantityAvailable: stockItemsTable.quantityAvailable,
            sku: productVariantsTable.sku,
            productName: productsTable.productName,
        })
            .from(stockItemsTable)
            .leftJoin(productVariantsTable, eq(stockItemsTable.productVariantId, productVariantsTable.id))
            .leftJoin(productsTable, eq(stockItemsTable.productId, productsTable.id))
            .where(and(eq(stockItemsTable.companyId, input.companyId), eq(stockItemsTable.warehouseId, input.sourceWarehouseId), sql `${stockItemsTable.id} in (${sql.join(input.items.map((item) => sql `${item.stockItemId}`), sql `, `)})`));
        return input.items.map((item) => {
            const stock = stockItems.find((s) => s.id === item.stockItemId);
            const available = stock ? Number(stock.quantityAvailable) : 0;
            return {
                stockItemId: item.stockItemId,
                sku: stock?.sku || null,
                productName: stock?.productName || null,
                availableQty: available,
                requestedQty: item.quantity,
                isAvailable: available >= item.quantity,
            };
        });
    }
    async getRecent(companyId, limit = 5) {
        const db = Db2Connection.getInstance();
        return db
            .select()
            .from(stockTransfersTable)
            .where(eq(stockTransfersTable.companyId, companyId))
            .orderBy(desc(stockTransfersTable.createdAt))
            .limit(limit);
    }
    async getNextNumber(companyId) {
        const db = Db2Connection.getInstance();
        const [totalRow] = await db
            .select({ value: count() })
            .from(stockTransfersTable)
            .where(eq(stockTransfersTable.companyId, companyId));
        const countVal = Number(totalRow?.value ?? 0) + 1;
        const padded = String(countVal).padStart(5, "0");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        return `TRF-${today}-${padded}`;
    }
}

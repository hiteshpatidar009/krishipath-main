import { randomUUID } from "crypto";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { Db2Connection } from "../../../../infrastructure/database";
import { AppError } from "../../../../shared/errors/app.error";
import { goodsReceiptItemsTable, goodsReceiptsTable, purchaseOrderItemsTable, purchaseOrdersTable, stockItemsTable, stockMovementsTable, suppliersTable, } from "../../../../infrastructure/database/postgres/schemas/db2";
export class PostgresPurchaseProcurementRepository {
    async createSupplier(input) {
        const supplierId = randomUUID();
        const now = new Date();
        await Db2Connection.getInstance().insert(suppliersTable).values({
            id: supplierId,
            companyId: input.companyId,
            supplierCode: input.supplierCode,
            supplierName: input.supplierName,
            supplierType: input.supplierType,
            email: input.email,
            phone: input.phone,
            website: input.website,
            taxNumber: input.taxNumber,
            paymentTerms: input.paymentTerms,
            status: "active",
            createdAt: now,
            updatedAt: now,
        });
        return { supplierId };
    }
    async createPurchaseOrder(input) {
        const db = Db2Connection.getInstance();
        const purchaseOrderId = randomUUID();
        const subtotal = input.items.reduce((total, item) => total + item.quantityOrdered * item.unitCost, 0);
        const taxAmount = input.items.reduce((total, item) => total + (item.taxAmount ?? 0), 0);
        const discountAmount = input.items.reduce((total, item) => total + (item.discountAmount ?? 0), 0);
        const totalAmount = subtotal + taxAmount - discountAmount;
        const createdItems = input.items.map((item) => {
            const lineTotal = item.quantityOrdered * item.unitCost +
                (item.taxAmount ?? 0) -
                (item.discountAmount ?? 0);
            return {
                id: randomUUID(),
                purchaseOrderId,
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantityOrdered: String(item.quantityOrdered),
                quantityReceived: "0",
                unitCost: String(item.unitCost),
                lineTotal: String(lineTotal),
            };
        });
        await db.transaction(async (tx) => {
            await tx.insert(purchaseOrdersTable).values({
                id: purchaseOrderId,
                companyId: input.companyId,
                supplierId: input.supplierId,
                warehouseId: input.warehouseId,
                purchaseOrderNumber: input.purchaseOrderNumber,
                orderDate: new Date().toISOString().split('T')[0],
                expectedDeliveryDate: input.expectedDeliveryDate || null,
                status: input.status,
                subtotal: String(subtotal),
                taxAmount: String(taxAmount),
                shippingAmount: "0",
                discountAmount: String(discountAmount),
                totalAmount: String(totalAmount),
                currencyCode: input.currencyCode,
                approvedBy: null,
                createdBy: input.createdBy,
                createdAt: new Date(),
            });
            await tx.insert(purchaseOrderItemsTable).values(input.items.map((item, index) => {
                const createdItem = createdItems[index];
                return {
                    id: createdItem.id,
                    purchaseOrderId,
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    quantityOrdered: String(item.quantityOrdered),
                    quantityReceived: "0",
                    unitCost: String(item.unitCost),
                    taxAmount: String(item.taxAmount ?? 0),
                    discountAmount: String(item.discountAmount ?? 0),
                    lineTotal: createdItem.lineTotal ?? "0",
                };
            }));
        });
        return { purchaseOrderId, items: createdItems };
    }
    async findPurchaseOrderByNumber(companyId, purchaseOrderNumber) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: purchaseOrdersTable.id,
            companyId: purchaseOrdersTable.companyId,
            status: purchaseOrdersTable.status,
            purchaseOrderNumber: purchaseOrdersTable.purchaseOrderNumber,
            supplierId: purchaseOrdersTable.supplierId,
            warehouseId: purchaseOrdersTable.warehouseId,
            totalAmount: purchaseOrdersTable.totalAmount,
            currencyCode: purchaseOrdersTable.currencyCode,
            createdBy: purchaseOrdersTable.createdBy,
            createdAt: purchaseOrdersTable.createdAt,
        })
            .from(purchaseOrdersTable)
            .where(and(eq(purchaseOrdersTable.companyId, companyId), eq(purchaseOrdersTable.purchaseOrderNumber, purchaseOrderNumber)))
            .limit(1);
        return rows[0] ?? null;
    }
    async listPurchaseOrders(input) {
        const conditions = [eq(purchaseOrdersTable.companyId, input.companyId)];
        if (input.status) {
            conditions.push(eq(purchaseOrdersTable.status, input.status));
        }
        if (input.supplierId) {
            conditions.push(eq(purchaseOrdersTable.supplierId, input.supplierId));
        }
        return Db2Connection.getInstance()
            .select({
            id: purchaseOrdersTable.id,
            companyId: purchaseOrdersTable.companyId,
            status: purchaseOrdersTable.status,
            purchaseOrderNumber: purchaseOrdersTable.purchaseOrderNumber,
            supplierId: purchaseOrdersTable.supplierId,
            warehouseId: purchaseOrdersTable.warehouseId,
            totalAmount: purchaseOrdersTable.totalAmount,
            currencyCode: purchaseOrdersTable.currencyCode,
            createdBy: purchaseOrdersTable.createdBy,
            createdAt: purchaseOrdersTable.createdAt,
        })
            .from(purchaseOrdersTable)
            .where(and(...conditions));
    }
    async findPurchaseOrder(companyId, purchaseOrderId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: purchaseOrdersTable.id,
            companyId: purchaseOrdersTable.companyId,
            status: purchaseOrdersTable.status,
            purchaseOrderNumber: purchaseOrdersTable.purchaseOrderNumber,
            supplierId: purchaseOrdersTable.supplierId,
            warehouseId: purchaseOrdersTable.warehouseId,
            totalAmount: purchaseOrdersTable.totalAmount,
            currencyCode: purchaseOrdersTable.currencyCode,
            createdBy: purchaseOrdersTable.createdBy,
            createdAt: purchaseOrdersTable.createdAt,
        })
            .from(purchaseOrdersTable)
            .where(and(eq(purchaseOrdersTable.companyId, companyId), eq(purchaseOrdersTable.id, purchaseOrderId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async updatePurchaseOrderStatus(companyId, purchaseOrderId, status, approvedBy) {
        await Db2Connection.getInstance()
            .update(purchaseOrdersTable)
            .set({ status, approvedBy })
            .where(and(eq(purchaseOrdersTable.companyId, companyId), eq(purchaseOrdersTable.id, purchaseOrderId)));
    }
    async listPurchaseOrderItems(purchaseOrderId) {
        return Db2Connection.getInstance()
            .select({
            id: purchaseOrderItemsTable.id,
            purchaseOrderId: purchaseOrderItemsTable.purchaseOrderId,
            productId: purchaseOrderItemsTable.productId,
            productVariantId: purchaseOrderItemsTable.productVariantId,
            quantityOrdered: purchaseOrderItemsTable.quantityOrdered,
            quantityReceived: purchaseOrderItemsTable.quantityReceived,
            unitCost: purchaseOrderItemsTable.unitCost,
            lineTotal: purchaseOrderItemsTable.lineTotal,
        })
            .from(purchaseOrderItemsTable)
            .where(eq(purchaseOrderItemsTable.purchaseOrderId, purchaseOrderId));
    }
    async receivePurchaseOrder(input) {
        const goodsReceiptId = randomUUID();
        try {
            await Db2Connection.getInstance().transaction(async (tx) => {
                await tx.insert(goodsReceiptsTable).values({
                    id: goodsReceiptId,
                    purchaseOrderId: input.purchaseOrderId,
                    warehouseId: input.warehouseId,
                    goodsReceiptNumber: `GR-${Date.now()}`,
                    receivedBy: input.receivedBy,
                    receivedAt: new Date(),
                    receiptStatus: "received",
                });
                await tx.insert(goodsReceiptItemsTable).values(input.items.map((item) => ({
                    id: randomUUID(),
                    goodsReceiptId,
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    quantityReceived: String(item.quantityReceived),
                    quantityRejected: String(item.quantityRejected ?? 0),
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                })));
                for (const item of input.items) {
                    const [orderItem] = await tx
                        .select({
                        productId: purchaseOrderItemsTable.productId,
                        productVariantId: purchaseOrderItemsTable.productVariantId,
                        unitCost: purchaseOrderItemsTable.unitCost,
                    })
                        .from(purchaseOrderItemsTable)
                        .where(and(eq(purchaseOrderItemsTable.id, item.purchaseOrderItemId), eq(purchaseOrderItemsTable.purchaseOrderId, input.purchaseOrderId)))
                        .limit(1);
                    if (!orderItem?.productVariantId) {
                        throw new AppError("Purchase order item requires SKU", 422, "PROCUREMENT_SKU_REQUIRED");
                    }
                    await tx
                        .update(purchaseOrderItemsTable)
                        .set({
                        quantityReceived: sql `${purchaseOrderItemsTable.quantityReceived} + ${String(item.quantityReceived)}`,
                    })
                        .where(and(eq(purchaseOrderItemsTable.id, item.purchaseOrderItemId), eq(purchaseOrderItemsTable.purchaseOrderId, input.purchaseOrderId)));
                    const [existingStock] = await tx
                        .select()
                        .from(stockItemsTable)
                        .where(and(eq(stockItemsTable.companyId, input.companyId), eq(stockItemsTable.productVariantId, orderItem.productVariantId), eq(stockItemsTable.warehouseId, input.warehouseId), isNull(stockItemsTable.binLocationId)))
                        .limit(1);
                    const quantityBefore = Number(existingStock?.quantityOnHand ?? 0);
                    const quantityAfter = quantityBefore + item.quantityReceived;
                    const stockItemId = existingStock?.id ?? randomUUID();
                    if (existingStock) {
                        await tx
                            .update(stockItemsTable)
                            .set({
                            quantityOnHand: sql `${stockItemsTable.quantityOnHand} + ${item.quantityReceived}`,
                            quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${item.quantityReceived}`,
                            quantityReceived: sql `coalesce(${stockItemsTable.quantityReceived}, 0) + ${item.quantityReceived}`,
                            averageCost: orderItem.unitCost,
                            lastMovementAt: new Date(),
                            updatedAt: new Date(),
                            version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
                        })
                            .where(eq(stockItemsTable.id, existingStock.id));
                    }
                    else {
                        await tx.insert(stockItemsTable).values({
                            id: stockItemId,
                            companyId: input.companyId,
                            productId: orderItem.productId,
                            productVariantId: orderItem.productVariantId,
                            warehouseId: input.warehouseId,
                            quantityOnHand: String(item.quantityReceived),
                            quantityAvailable: String(item.quantityReceived),
                            quantityReserved: "0",
                            quantityAllocated: "0",
                            quantityInTransit: "0",
                            quantityOnOrder: "0",
                            quantityPicked: "0",
                            quantityPacked: "0",
                            quantityShipped: "0",
                            quantityReceived: String(item.quantityReceived),
                            quantityDamaged: "0",
                            quantityQuarantine: "0",
                            quantityReturned: "0",
                            quantityBlocked: "0",
                            averageCost: orderItem.unitCost,
                            lastMovementAt: new Date(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            version: 1,
                        });
                    }
                    const movementId = randomUUID();
                    await tx.insert(stockMovementsTable).values({
                        id: movementId,
                        companyId: input.companyId,
                        stockItemId,
                        transactionNumber: `INV-${Date.now()}-${movementId.slice(0, 8)}`,
                        movementType: "receiving",
                        referenceType: "goods_receipt",
                        referenceId: goodsReceiptId,
                        destinationWarehouseId: input.warehouseId,
                        quantity: String(item.quantityReceived),
                        quantityBefore: String(quantityBefore),
                        quantityAfter: String(quantityAfter),
                        unitCost: orderItem.unitCost,
                        totalCost: String(Number(orderItem.unitCost ?? 0) * item.quantityReceived),
                        movementReason: "purchase_order_receipt",
                        movementDate: new Date(),
                        performedBy: input.receivedBy,
                        idempotencyKey: `goods-receipt:${goodsReceiptId}:${item.purchaseOrderItemId}`,
                        metadata: {
                            purchaseOrderId: input.purchaseOrderId,
                            purchaseOrderItemId: item.purchaseOrderItemId,
                            batchNumber: item.batchNumber,
                            expiryDate: item.expiryDate,
                        },
                        createdAt: new Date(),
                    });
                }
                await tx
                    .update(purchaseOrdersTable)
                    .set({ status: input.resultingStatus ?? "partially_received" })
                    .where(and(eq(purchaseOrdersTable.id, input.purchaseOrderId), eq(purchaseOrdersTable.companyId, input.companyId)));
            });
        }
        catch (error) {
            if (this.isForeignKeyError(error)) {
                throw new AppError("Invalid purchase order, warehouse, or item reference", 404, "PROCUREMENT_REFERENCE_NOT_FOUND");
            }
            throw error;
        }
        return { goodsReceiptId };
    }
    async listGoodsReceipts(input) {
        const conditions = [eq(purchaseOrdersTable.companyId, input.companyId)];
        if (input.purchaseOrderId) {
            conditions.push(eq(goodsReceiptsTable.purchaseOrderId, input.purchaseOrderId));
        }
        const receipts = await Db2Connection.getInstance()
            .select({
            id: goodsReceiptsTable.id,
            purchaseOrderId: goodsReceiptsTable.purchaseOrderId,
            warehouseId: goodsReceiptsTable.warehouseId,
            goodsReceiptNumber: goodsReceiptsTable.goodsReceiptNumber,
            receivedBy: goodsReceiptsTable.receivedBy,
            receivedAt: goodsReceiptsTable.receivedAt,
            receiptStatus: goodsReceiptsTable.receiptStatus,
            purchaseOrderNumber: purchaseOrdersTable.purchaseOrderNumber,
            purchaseOrderStatus: purchaseOrdersTable.status,
            supplierId: purchaseOrdersTable.supplierId,
            purchaseOrderWarehouseId: purchaseOrdersTable.warehouseId,
            totalAmount: purchaseOrdersTable.totalAmount,
            currencyCode: purchaseOrdersTable.currencyCode,
        })
            .from(goodsReceiptsTable)
            .innerJoin(purchaseOrdersTable, eq(goodsReceiptsTable.purchaseOrderId, purchaseOrdersTable.id))
            .where(and(...conditions));
        return this.attachReceiptItems(receipts);
    }
    async findGoodsReceipt(input) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: goodsReceiptsTable.id,
            purchaseOrderId: goodsReceiptsTable.purchaseOrderId,
            warehouseId: goodsReceiptsTable.warehouseId,
            goodsReceiptNumber: goodsReceiptsTable.goodsReceiptNumber,
            receivedBy: goodsReceiptsTable.receivedBy,
            receivedAt: goodsReceiptsTable.receivedAt,
            receiptStatus: goodsReceiptsTable.receiptStatus,
            purchaseOrderNumber: purchaseOrdersTable.purchaseOrderNumber,
            purchaseOrderStatus: purchaseOrdersTable.status,
            supplierId: purchaseOrdersTable.supplierId,
            purchaseOrderWarehouseId: purchaseOrdersTable.warehouseId,
            totalAmount: purchaseOrdersTable.totalAmount,
            currencyCode: purchaseOrdersTable.currencyCode,
        })
            .from(goodsReceiptsTable)
            .innerJoin(purchaseOrdersTable, eq(goodsReceiptsTable.purchaseOrderId, purchaseOrdersTable.id))
            .where(and(eq(purchaseOrdersTable.companyId, input.companyId), eq(goodsReceiptsTable.id, input.goodsReceiptId)))
            .limit(1);
        if (!rows[0]) {
            return null;
        }
        const [receipt] = await this.attachReceiptItems(rows);
        return receipt ?? null;
    }
    async attachReceiptItems(receipts) {
        if (!receipts.length) {
            return [];
        }
        const receiptItems = await Db2Connection.getInstance()
            .select({
            id: goodsReceiptItemsTable.id,
            goodsReceiptId: goodsReceiptItemsTable.goodsReceiptId,
            purchaseOrderItemId: goodsReceiptItemsTable.purchaseOrderItemId,
            quantityReceived: goodsReceiptItemsTable.quantityReceived,
            quantityRejected: goodsReceiptItemsTable.quantityRejected,
            batchNumber: goodsReceiptItemsTable.batchNumber,
            expiryDate: goodsReceiptItemsTable.expiryDate,
        })
            .from(goodsReceiptItemsTable)
            .where(inArray(goodsReceiptItemsTable.goodsReceiptId, receipts.map((receipt) => receipt.id)));
        return receipts.map((receipt) => ({
            id: receipt.id,
            purchaseOrderId: receipt.purchaseOrderId,
            warehouseId: receipt.warehouseId,
            goodsReceiptNumber: receipt.goodsReceiptNumber,
            receivedBy: receipt.receivedBy,
            receivedAt: receipt.receivedAt,
            receiptStatus: receipt.receiptStatus,
            purchaseOrder: {
                id: receipt.purchaseOrderId ?? "",
                purchaseOrderNumber: receipt.purchaseOrderNumber,
                status: receipt.purchaseOrderStatus,
                supplierId: receipt.supplierId,
                warehouseId: receipt.purchaseOrderWarehouseId,
                totalAmount: receipt.totalAmount,
                currencyCode: receipt.currencyCode,
            },
            items: receiptItems
                .filter((item) => item.goodsReceiptId === receipt.id)
                .map(({ goodsReceiptId: _goodsReceiptId, ...item }) => item),
        }));
    }
    isForeignKeyError(error) {
        const errorLike = error;
        return String(errorLike.code ?? errorLike.cause?.code ?? "") === "23503";
    }
}

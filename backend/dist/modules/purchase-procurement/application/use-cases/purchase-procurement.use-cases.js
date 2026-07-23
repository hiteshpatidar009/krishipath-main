import { CoreEventBus, EventEnvelopeFactory } from "../../../../core";
import { logger } from "../../../../infrastructure/logger";
import { AppError } from "../../../../shared/errors/app.error";
import { SubscriptionLimitService } from "../../../subscription";
import { ProcurementIntegrityPolicy, PurchaseOrderAggregate, } from "../../domain";
import { ProcurementEvents } from "../../events/procurement.events";
export class CreateSupplierUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.createSupplier(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: result.supplierId,
            name: ProcurementEvents.supplierUpdated,
            source: "purchase-procurement",
            payload: result,
            metadata: { companyId: input.companyId },
        }));
        return result;
    }
}
export class CreatePurchaseOrderUseCase {
    repository;
    workflowApprovalContract;
    policy = new ProcurementIntegrityPolicy();
    constructor(repository, workflowApprovalContract) {
        this.repository = repository;
        this.workflowApprovalContract = workflowApprovalContract;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanCreatePurchaseOrder(input.companyId);
        const duplicate = await this.repository.findPurchaseOrderByNumber(input.companyId, input.purchaseOrderNumber);
        if (duplicate) {
            throw new AppError("Duplicate purchase order", 409, "DUPLICATE_PO");
        }
        const aggregate = PurchaseOrderAggregate.create({
            id: "pending",
            ...input,
        });
        if (this.policy.isSuspiciousAmount(aggregate.totalAmount)) {
            await logger.warn("Suspicious procurement amount detected", {
                module: "purchase-procurement",
                companyId: input.companyId,
                userId: input.createdBy,
                tags: ["procurement", "suspicious", "po"],
                payload: {
                    purchaseOrderNumber: input.purchaseOrderNumber,
                    totalAmount: aggregate.totalAmount,
                },
            });
        }
        const result = await this.repository.createPurchaseOrder(input);
        let workflowApprovalRequestId;
        if (input.status === "approval_required" &&
            input.workflowDefinitionId &&
            this.workflowApprovalContract) {
            const workflow = await this.workflowApprovalContract.start({
                companyId: input.companyId,
                workflowDefinitionId: input.workflowDefinitionId,
                entityType: "purchase_order",
                entityId: result.purchaseOrderId,
                requestedBy: input.createdBy,
            });
            workflowApprovalRequestId = workflow.approvalRequestId;
        }
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: result.purchaseOrderId,
            name: ProcurementEvents.poCreated,
            source: "purchase-procurement",
            payload: { ...result, workflowApprovalRequestId },
            metadata: {
                companyId: input.companyId,
                userId: input.createdBy,
                idempotencyKey: input.idempotencyKey,
            },
        }));
        await SubscriptionLimitService.checkPurchaseOrderLimit(input.companyId, input.createdBy);
        return {
            ...result,
            items: result.items.map((item) => ({
                ...item,
                purchaseOrderItemId: item.id,
            })),
            workflowApprovalRequestId,
        };
    }
}
export class ListPurchaseOrdersUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        return this.repository.listPurchaseOrders(input);
    }
}
export class GetPurchaseOrderUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, purchaseOrderId) {
        const po = await this.repository.findPurchaseOrder(companyId, purchaseOrderId);
        if (!po) {
            throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
        }
        const items = await this.repository.listPurchaseOrderItems(purchaseOrderId);
        return {
            ...po,
            items: items.map((item) => ({
                ...item,
                purchaseOrderItemId: item.id,
            })),
        };
    }
}
export class ApprovePurchaseOrderUseCase {
    repository;
    policy = new ProcurementIntegrityPolicy();
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        const po = await this.requirePo(input.companyId, input.purchaseOrderId);
        this.policy.ensureTransition(po.status, "approved");
        await this.repository.updatePurchaseOrderStatus(input.companyId, input.purchaseOrderId, "approved", input.approvedBy);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.purchaseOrderId}:approved`,
            name: ProcurementEvents.poApproved,
            source: "purchase-procurement",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.approvedBy },
        }));
        return { approved: true };
    }
    async requirePo(companyId, purchaseOrderId) {
        const po = await this.repository.findPurchaseOrder(companyId, purchaseOrderId);
        if (!po) {
            throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
        }
        return po;
    }
}
export class RejectPurchaseOrderUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        const po = await this.repository.findPurchaseOrder(input.companyId, input.purchaseOrderId);
        if (!po) {
            throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
        }
        new ProcurementIntegrityPolicy().ensureTransition(po.status, "rejected");
        await this.repository.updatePurchaseOrderStatus(input.companyId, input.purchaseOrderId, "rejected");
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.purchaseOrderId}:rejected`,
            name: ProcurementEvents.poRejected,
            source: "purchase-procurement",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.rejectedBy },
        }));
        return { rejected: true };
    }
}
export class CancelPurchaseOrderUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        const po = await this.repository.findPurchaseOrder(input.companyId, input.purchaseOrderId);
        if (!po) {
            throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
        }
        new ProcurementIntegrityPolicy().ensureTransition(po.status, "cancelled");
        await this.repository.updatePurchaseOrderStatus(input.companyId, input.purchaseOrderId, "cancelled");
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.purchaseOrderId}:cancelled`,
            name: ProcurementEvents.poCancelled,
            source: "purchase-procurement",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.cancelledBy },
        }));
        return { cancelled: true };
    }
}
export class ReceivePurchaseOrderUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        const po = await this.repository.findPurchaseOrder(input.companyId, input.purchaseOrderId);
        if (!po) {
            throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
        }
        new ProcurementIntegrityPolicy().ensureTransition(po.status, "partially_received");
        const orderItems = await this.repository.listPurchaseOrderItems(input.purchaseOrderId);
        const orderItemsById = new Map(orderItems.map((item) => [item.id, item]));
        const requestedItemIds = new Set();
        const invalidItem = input.items.find((item) => {
            if (requestedItemIds.has(item.purchaseOrderItemId)) {
                return true;
            }
            requestedItemIds.add(item.purchaseOrderItemId);
            return !orderItemsById.has(item.purchaseOrderItemId);
        });
        if (invalidItem) {
            throw new AppError("Invalid or duplicate purchase order item", 422, "PO_ITEM_INVALID");
        }
        for (const item of input.items) {
            const orderItem = orderItemsById.get(item.purchaseOrderItemId);
            const ordered = Number(orderItem.quantityOrdered ?? 0);
            const alreadyReceived = Number(orderItem.quantityReceived ?? 0);
            if (alreadyReceived + item.quantityReceived > ordered) {
                throw new AppError("Received quantity exceeds purchase order quantity", 422, "PO_RECEIPT_QUANTITY_EXCEEDED");
            }
        }
        const requestedQuantities = new Map(input.items.map((item) => [
            item.purchaseOrderItemId,
            item.quantityReceived,
        ]));
        const fullyReceived = orderItems.every((item) => {
            const ordered = Number(item.quantityOrdered ?? 0);
            const alreadyReceived = Number(item.quantityReceived ?? 0);
            return alreadyReceived + (requestedQuantities.get(item.id) ?? 0) >= ordered;
        });
        const result = await this.repository.receivePurchaseOrder({
            ...input,
            resultingStatus: fullyReceived ? "received" : "partially_received",
        });
        const rejected = input.items.some((item) => (item.quantityRejected ?? 0) > 0);
        if (rejected) {
            await CoreEventBus.publish(EventEnvelopeFactory.create({
                id: `${result.goodsReceiptId}:discrepancy`,
                name: ProcurementEvents.discrepancyDetected,
                source: "purchase-procurement",
                payload: { ...input, ...result },
                metadata: { companyId: input.companyId, userId: input.receivedBy },
            }));
        }
        return result;
    }
}
export class ListGoodsReceiptsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        return this.repository.listGoodsReceipts(input);
    }
}
export class GetGoodsReceiptUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, goodsReceiptId) {
        const receipt = await this.repository.findGoodsReceipt({
            companyId,
            goodsReceiptId,
        });
        if (!receipt) {
            throw new AppError("Goods receipt not found", 404, "GOODS_RECEIPT_NOT_FOUND");
        }
        return receipt;
    }
}

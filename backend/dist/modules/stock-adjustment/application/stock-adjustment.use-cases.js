import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AdjustmentApprovalPolicy, } from "../domain";
import { StockAdjustmentEvents } from "../events/stock-adjustment.events";
export class CreateStockAdjustmentUseCase {
    repository;
    workflow;
    policy = new AdjustmentApprovalPolicy();
    constructor(repository, workflow) {
        this.repository = repository;
        this.workflow = workflow;
    }
    async execute(input) {
        let totalQty = 0;
        if (input.lines && input.lines.length > 0) {
            totalQty = input.lines.reduce((sum, line) => sum + Math.abs(line.adjustedQuantity), 0);
        }
        else {
            totalQty = Math.abs(input.quantity || 0);
        }
        const requiresApproval = this.policy.requiresApproval(totalQty);
        const isDraft = input.status === "draft";
        // If it is draft, it does not go to pending approval yet
        const actualStatus = isDraft ? "draft" : (requiresApproval ? "pending_approval" : "approved");
        const result = await this.repository.create({ ...input, status: actualStatus }, isDraft ? false : requiresApproval, this.policy.threshold());
        let approvalRequestId;
        if (!isDraft && requiresApproval && input.workflowDefinitionId && this.workflow) {
            approvalRequestId = (await this.workflow.start({
                companyId: input.companyId,
                workflowDefinitionId: input.workflowDefinitionId,
                entityType: "stock_adjustment",
                entityId: result.adjustmentId,
                requestedBy: input.createdBy,
            })).approvalRequestId;
            await this.repository.setApprovalRequestId(input.companyId, result.adjustmentId, approvalRequestId);
        }
        await this.publish(StockAdjustmentEvents.created, result.adjustmentId, input.companyId, input.createdBy, {
            ...result, approvalRequestId,
        });
        await logger.security("Stock adjustment created", {
            module: "stock-adjustment",
            action: StockAdjustmentEvents.created,
            companyId: input.companyId,
            userId: input.createdBy,
            actorId: input.createdBy,
            payload: { ...result, approvalRequestId },
        });
        return { ...result, approvalRequestId };
    }
    async publish(name, id, companyId, actorId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id, name, source: "stock-adjustment", payload,
            metadata: { companyId, userId: actorId },
        }));
    }
}
export class UpdateStockAdjustmentUseCase {
    repository;
    workflow;
    policy = new AdjustmentApprovalPolicy();
    constructor(repository, workflow) {
        this.repository = repository;
        this.workflow = workflow;
    }
    async execute(adjustmentId, input) {
        let totalQty = 0;
        if (input.lines && input.lines.length > 0) {
            totalQty = input.lines.reduce((sum, line) => sum + Math.abs(line.adjustedQuantity), 0);
        }
        const requiresApproval = this.policy.requiresApproval(totalQty);
        const isDraft = input.status === "draft";
        const actualStatus = isDraft ? "draft" : (requiresApproval ? "pending_approval" : "approved");
        const result = await this.repository.update(adjustmentId, { ...input, status: actualStatus }, isDraft ? false : requiresApproval, this.policy.threshold());
        let approvalRequestId;
        if (!isDraft && requiresApproval && input.workflowDefinitionId && this.workflow) {
            approvalRequestId = (await this.workflow.start({
                companyId: input.companyId,
                workflowDefinitionId: input.workflowDefinitionId,
                entityType: "stock_adjustment",
                entityId: adjustmentId,
                requestedBy: input.updatedBy,
            })).approvalRequestId;
            await this.repository.setApprovalRequestId(input.companyId, adjustmentId, approvalRequestId);
        }
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: StockAdjustmentEvents.updated,
            source: "stock-adjustment",
            payload: { ...result, approvalRequestId },
            metadata: { companyId: input.companyId, userId: input.updatedBy },
        }));
        await logger.security("Stock adjustment updated", {
            module: "stock-adjustment",
            action: StockAdjustmentEvents.updated,
            companyId: input.companyId,
            userId: input.updatedBy,
            actorId: input.updatedBy,
            payload: { ...result, approvalRequestId },
        });
        return { ...result, approvalRequestId };
    }
}
export class SubmitStockAdjustmentUseCase {
    repository;
    workflow;
    policy = new AdjustmentApprovalPolicy();
    constructor(repository, workflow) {
        this.repository = repository;
        this.workflow = workflow;
    }
    async execute(companyId, adjustmentId, actorId, workflowDefinitionId) {
        const adj = await this.repository.findById(companyId, adjustmentId);
        if (!adj) {
            throw new Error("Adjustment not found");
        }
        const totalQty = adj.lines.reduce((sum, line) => sum + Math.abs(Number(line.adjustedQuantity || 0)), 0);
        const requiresApproval = this.policy.requiresApproval(totalQty);
        const result = await this.repository.submit(companyId, adjustmentId, actorId, requiresApproval, this.policy.threshold());
        let approvalRequestId;
        if (requiresApproval && workflowDefinitionId && this.workflow) {
            approvalRequestId = (await this.workflow.start({
                companyId,
                workflowDefinitionId,
                entityType: "stock_adjustment",
                entityId: adjustmentId,
                requestedBy: actorId,
            })).approvalRequestId;
            await this.repository.setApprovalRequestId(companyId, adjustmentId, approvalRequestId);
        }
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: "stock-adjustment.submitted",
            source: "stock-adjustment",
            payload: { adjustmentId, status: result.status, approvalRequestId },
            metadata: { companyId, userId: actorId },
        }));
        await logger.security("Stock adjustment submitted for approval", {
            module: "stock-adjustment",
            action: "stock-adjustment.submitted",
            companyId,
            userId: actorId,
            actorId,
            payload: { adjustmentId, status: result.status, approvalRequestId },
        });
        return { ...result, approvalRequestId };
    }
}
export class CancelStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, adjustmentId, actorId) {
        await this.repository.cancel(companyId, adjustmentId, actorId);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: "stock-adjustment.cancelled",
            source: "stock-adjustment",
            payload: { adjustmentId },
            metadata: { companyId, userId: actorId },
        }));
        await logger.security("Stock adjustment cancelled", {
            module: "stock-adjustment",
            action: "stock-adjustment.cancelled",
            companyId,
            userId: actorId,
            actorId,
            payload: { adjustmentId },
        });
        return { cancelled: true };
    }
}
export class RequestChangesStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, adjustmentId, actorId, comments) {
        await this.repository.requestChanges(companyId, adjustmentId, actorId, comments);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: "stock-adjustment.changes_requested",
            source: "stock-adjustment",
            payload: { adjustmentId, comments },
            metadata: { companyId, userId: actorId },
        }));
        await logger.security("Stock adjustment changes requested", {
            module: "stock-adjustment",
            action: "stock-adjustment.changes_requested",
            companyId,
            userId: actorId,
            actorId,
            payload: { adjustmentId, comments },
        });
        return { success: true };
    }
}
export class ReassignStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, adjustmentId, actorId, reassignedToUserId, comments) {
        await this.repository.reassign(companyId, adjustmentId, actorId, reassignedToUserId, comments);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: "stock-adjustment.reassigned",
            source: "stock-adjustment",
            payload: { adjustmentId, reassignedToUserId, comments },
            metadata: { companyId, userId: actorId },
        }));
        await logger.security("Stock adjustment approval reassigned", {
            module: "stock-adjustment",
            action: "stock-adjustment.reassigned",
            companyId,
            userId: actorId,
            actorId,
            payload: { adjustmentId, reassignedToUserId, comments },
        });
        return { success: true };
    }
}
export class AddCommentStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, adjustmentId, createdBy, commentText, commentType) {
        await this.repository.addComment(companyId, adjustmentId, commentText, commentType, createdBy);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: "stock-adjustment.comment_added",
            source: "stock-adjustment",
            payload: { adjustmentId, commentText, commentType },
            metadata: { companyId, userId: createdBy },
        }));
        return { success: true };
    }
}
export class AddAttachmentStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, adjustmentId, uploadedBy, fileName, fileSize, contentType, fileUrl) {
        await this.repository.addAttachment(companyId, adjustmentId, fileName, fileSize, contentType, fileUrl, uploadedBy);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: adjustmentId,
            name: "stock-adjustment.attachment_uploaded",
            source: "stock-adjustment",
            payload: { adjustmentId, fileName, fileUrl },
            metadata: { companyId, userId: uploadedBy },
        }));
        return { success: true };
    }
}
export class ApproveStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.approve(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.adjustmentId,
            name: StockAdjustmentEvents.approved,
            source: "stock-adjustment",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        await logger.security("Stock adjustment approved", {
            module: "stock-adjustment",
            action: StockAdjustmentEvents.approved,
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { adjustmentId: input.adjustmentId },
        });
        return { approved: true };
    }
}
export class RejectStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.reject(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.adjustmentId,
            name: StockAdjustmentEvents.rejected,
            source: "stock-adjustment",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        await logger.security("Stock adjustment rejected", {
            module: "stock-adjustment",
            action: StockAdjustmentEvents.rejected,
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { adjustmentId: input.adjustmentId },
        });
        return { rejected: true };
    }
}
export class ListStockAdjustmentsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.list(input);
        return { ...result, page: input.page, limit: input.limit };
    }
}
export class GetStockAdjustmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, adjustmentId) {
        return this.repository.findById(companyId, adjustmentId);
    }
}

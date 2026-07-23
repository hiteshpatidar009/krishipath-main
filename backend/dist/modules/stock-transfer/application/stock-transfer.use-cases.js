import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { StockTransferEvents } from "../events/stock-transfer.events";
export class CreateStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.create(input);
        await this.publish(StockTransferEvents.created, result.transferId, input.companyId, input.createdBy, result);
        await logger.security("Stock transfer created", {
            module: "stock-transfer",
            action: StockTransferEvents.created,
            companyId: input.companyId,
            userId: input.createdBy,
            actorId: input.createdBy,
            payload: result,
        });
        return result;
    }
    async publish(name, id, companyId, actorId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id, name, source: "stock-transfer", payload,
            metadata: { companyId, userId: actorId },
        }));
    }
}
export class UpdateStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.update(input);
        await logger.security("Stock transfer updated", {
            module: "stock-transfer",
            action: "transfer.updated",
            companyId: input.companyId,
            userId: "system",
            actorId: "system",
            payload: { transferId: input.transferId },
        });
    }
}
export class TransitionStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input, target) {
        await this.repository.transition(input, target);
        const event = target === "approved" ? StockTransferEvents.approved
            : target === "in_transit" ? StockTransferEvents.dispatched
                : target === "received" ? StockTransferEvents.received
                    : target === "completed" ? StockTransferEvents.completed
                        : undefined;
        if (event) {
            await CoreEventBus.publish(EventEnvelopeFactory.create({
                id: input.transferId,
                name: event,
                source: "stock-transfer",
                payload: { ...input, status: target },
                metadata: { companyId: input.companyId, userId: input.actorId },
            }));
            await logger.security("Stock transfer transitioned", {
                module: "stock-transfer",
                action: event,
                companyId: input.companyId,
                userId: input.actorId,
                actorId: input.actorId,
                payload: { transferId: input.transferId, status: target },
            });
        }
        return { status: target };
    }
}
export class ListStockTransfersUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.list(input);
        return { ...result, page: input.page, limit: input.limit };
    }
}
export class GetStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId) {
        const transfer = await this.repository.get(companyId, transferId);
        if (!transfer)
            throw new AppError("Transfer not found", 404, "TRANSFER_NOT_FOUND");
        return transfer;
    }
}
export class PreCheckStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.preCheck(input);
    }
}
export class GetRecentStockTransfersUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, limit) {
        return this.repository.getRecent(companyId, limit);
    }
}
export class GetNextTransferNumberUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId) {
        return this.repository.getNextNumber(companyId);
    }
}
export class SubmitStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.transition(input, "submitted");
        await logger.security("Stock transfer submitted for approval", {
            module: "stock-transfer",
            action: "transfer.submitted",
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { transferId: input.transferId },
        });
        return { status: "submitted" };
    }
}
export class DecideStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input, decision, comments) {
        await this.repository.submitDecision(input, decision, comments);
        const targetStatus = decision === "approve" ? "approved" : "rejected";
        const event = decision === "approve" ? StockTransferEvents.approved : "transfer.rejected";
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.transferId,
            name: event,
            source: "stock-transfer",
            payload: { ...input, status: targetStatus, comments },
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        await logger.security(`Stock transfer approval decision: ${decision}`, {
            module: "stock-transfer",
            action: event,
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { transferId: input.transferId, decision, comments },
        });
        return { status: targetStatus };
    }
}
export class ReceiveStockTransferUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input, lines) {
        await this.repository.receive(input, lines);
        // After receiving, we load the transfer to check if it's completed or partially received.
        const transfer = await this.repository.get(input.companyId, input.transferId);
        const finalStatus = transfer?.transferStatus || "received";
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.transferId,
            name: StockTransferEvents.received,
            source: "stock-transfer",
            payload: { ...input, status: finalStatus, lines },
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        await logger.security("Stock transfer items received", {
            module: "stock-transfer",
            action: StockTransferEvents.received,
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { transferId: input.transferId, status: finalStatus, lines },
        });
        return { status: finalStatus };
    }
}
export class AddStockTransferAttachmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId, attachment) {
        const result = await this.repository.addAttachment(companyId, transferId, attachment);
        await logger.security("Stock transfer attachment uploaded", {
            module: "stock-transfer",
            action: "transfer.attachment.created",
            companyId,
            userId: attachment.uploadedBy,
            actorId: attachment.uploadedBy,
            payload: { transferId, attachment: result },
        });
        return result;
    }
}
export class DeleteStockTransferAttachmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId, attachmentId, actorId) {
        await this.repository.deleteAttachment(companyId, transferId, attachmentId);
        await logger.security("Stock transfer attachment deleted", {
            module: "stock-transfer",
            action: "transfer.attachment.deleted",
            companyId,
            userId: actorId,
            actorId,
            payload: { transferId, attachmentId },
        });
    }
}
export class GetStockTransferAttachmentsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId) {
        return this.repository.getAttachments(companyId, transferId);
    }
}
export class GetStockTransferTimelineUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId) {
        return this.repository.getTimeline(companyId, transferId);
    }
}
export class RecalculateStockTransferRouteUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId, actorId) {
        const result = await this.repository.recalculateRoute(companyId, transferId);
        await logger.security("Stock transfer route recalculated", {
            module: "stock-transfer",
            action: "transfer.route.recalculated",
            companyId,
            userId: actorId,
            actorId,
            payload: { transferId, route: result },
        });
        return result;
    }
}
export class GetStockTransferRiskAssessmentUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, transferId) {
        return this.repository.getRiskAssessment(companyId, transferId);
    }
}

import { and, count, eq, isNull } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database";
import { stockItemsTable, stockAdjustmentsTable } from "../../../infrastructure/database/postgres/schemas/db2";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { StockAdjustmentValidator } from "./stock-adjustment.validator";
export class StockAdjustmentController {
    createUseCase;
    approveUseCase;
    rejectUseCase;
    listUseCase;
    getUseCase;
    updateUseCase;
    submitUseCase;
    cancelUseCase;
    requestChangesUseCase;
    reassignUseCase;
    addCommentUseCase;
    addAttachmentUseCase;
    constructor(createUseCase, approveUseCase, rejectUseCase, listUseCase, getUseCase, updateUseCase, submitUseCase, cancelUseCase, requestChangesUseCase, reassignUseCase, addCommentUseCase, addAttachmentUseCase) {
        this.createUseCase = createUseCase;
        this.approveUseCase = approveUseCase;
        this.rejectUseCase = rejectUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.updateUseCase = updateUseCase;
        this.submitUseCase = submitUseCase;
        this.cancelUseCase = cancelUseCase;
        this.requestChangesUseCase = requestChangesUseCase;
        this.reassignUseCase = reassignUseCase;
        this.addCommentUseCase = addCommentUseCase;
        this.addAttachmentUseCase = addAttachmentUseCase;
    }
    create = async (request, response) => {
        const input = StockAdjustmentValidator.create.parse(request.body);
        const resolvedIp = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "");
        ApiResponse.created(response, await this.createUseCase.execute({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            idempotencyKey: String(request.header("idempotency-key") || `create-${Date.now()}`),
            ipAddress: input.ipAddress || resolvedIp || undefined,
        }), "Adjustment created");
    };
    update = async (request, response) => {
        const input = StockAdjustmentValidator.update.parse(request.body);
        const adjustmentId = String(request.params.adjustmentId);
        const resolvedIp = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "");
        const result = await this.updateUseCase.execute(adjustmentId, {
            ...input,
            companyId: RequestContext.companyId(request),
            updatedBy: RequestContext.userId(request),
            ipAddress: input.ipAddress || resolvedIp || undefined,
        });
        ApiResponse.ok(response, result, "Adjustment updated");
    };
    submit = async (request, response) => {
        const adjustmentId = String(request.params.adjustmentId);
        const workflowDefinitionId = request.body.workflowDefinitionId ? String(request.body.workflowDefinitionId) : undefined;
        const result = await this.submitUseCase.execute(RequestContext.companyId(request), adjustmentId, RequestContext.userId(request), workflowDefinitionId);
        ApiResponse.ok(response, result, "Adjustment submitted");
    };
    cancel = async (request, response) => {
        const adjustmentId = String(request.params.adjustmentId);
        const result = await this.cancelUseCase.execute(RequestContext.companyId(request), adjustmentId, RequestContext.userId(request));
        ApiResponse.ok(response, result, "Adjustment cancelled");
    };
    requestChanges = async (request, response) => {
        const input = StockAdjustmentValidator.requestChanges.parse(request.body);
        const adjustmentId = String(request.params.adjustmentId);
        const result = await this.requestChangesUseCase.execute(RequestContext.companyId(request), adjustmentId, RequestContext.userId(request), input.comments);
        ApiResponse.ok(response, result, "Changes requested");
    };
    reassign = async (request, response) => {
        const input = StockAdjustmentValidator.reassign.parse(request.body);
        const adjustmentId = String(request.params.adjustmentId);
        const result = await this.reassignUseCase.execute(RequestContext.companyId(request), adjustmentId, RequestContext.userId(request), input.reassignedToUserId, input.comments);
        ApiResponse.ok(response, result, "Adjustment reassigned");
    };
    addComment = async (request, response) => {
        const input = StockAdjustmentValidator.addComment.parse(request.body);
        const adjustmentId = String(request.params.adjustmentId);
        const result = await this.addCommentUseCase.execute(RequestContext.companyId(request), adjustmentId, RequestContext.userId(request), input.commentText, input.commentType);
        ApiResponse.ok(response, result, "Comment added");
    };
    addAttachment = async (request, response) => {
        const input = StockAdjustmentValidator.addAttachment.parse(request.body);
        const adjustmentId = String(request.params.adjustmentId);
        const result = await this.addAttachmentUseCase.execute(RequestContext.companyId(request), adjustmentId, RequestContext.userId(request), input.fileName, input.fileSize, input.contentType, input.fileUrl);
        ApiResponse.ok(response, result, "Attachment uploaded");
    };
    auditHistory = async (request, response) => {
        const adjustmentId = String(request.params.adjustmentId);
        const adjustment = await this.getUseCase.execute(RequestContext.companyId(request), adjustmentId);
        if (!adjustment) {
            ApiResponse.notFound(response, "Adjustment not found");
            return;
        }
        ApiResponse.ok(response, adjustment.auditHistory || [], "Audit history loaded");
    };
    approve = this.command("approve");
    reject = this.command("reject");
    list = async (request, response) => {
        const query = StockAdjustmentValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.listUseCase.execute({
            ...query, companyId: RequestContext.companyId(request),
        }), "Adjustments loaded");
    };
    get = async (request, response) => {
        const adjustment = await this.getUseCase.execute(RequestContext.companyId(request), String(request.params.adjustmentId));
        if (!adjustment) {
            ApiResponse.notFound(response, "Adjustment not found");
            return;
        }
        ApiResponse.ok(response, adjustment, "Adjustment details loaded");
    };
    nextNumber = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const db = Db2Connection.getInstance();
        const [totalRow] = await db
            .select({ value: count() })
            .from(stockAdjustmentsTable)
            .where(eq(stockAdjustmentsTable.companyId, companyId));
        const year = new Date().getFullYear();
        const sequence = String((totalRow?.value ?? 0) + 1).padStart(5, "0");
        ApiResponse.ok(response, {
            adjustmentNumber: `ADJ-${year}-${sequence}`,
        }, "Next adjustment number generated");
    };
    reasons = async (request, response) => {
        ApiResponse.ok(response, [
            { code: "DAMAGED_GOODS", name: "Damaged Goods" },
            { code: "THEFT", name: "Theft" },
            { code: "SHRINKAGE", name: "Shrinkage" },
            { code: "INVENTORY_COUNT", name: "Inventory Count" },
            { code: "CORRECTION", name: "Correction" },
        ], "Reasons loaded");
    };
    accounts = async (request, response) => {
        ApiResponse.ok(response, [
            { code: "INVENTORY_ADJUSTMENT", name: "Inventory Adjustment Account" },
            { code: "COST_OF_GOODS_SOLD", name: "Cost of Goods Sold" },
            { code: "DAMAGE_LOSS", name: "Damage / Loss Account" },
        ], "Adjustment accounts loaded");
    };
    validateLine = async (request, response) => {
        const input = StockAdjustmentValidator.validateLine.parse(request.body);
        const db = Db2Connection.getInstance();
        const [balance] = await db
            .select({
            id: stockItemsTable.id,
            quantityOnHand: stockItemsTable.quantityOnHand,
            averageCost: stockItemsTable.averageCost,
        })
            .from(stockItemsTable)
            .where(and(eq(stockItemsTable.productVariantId, input.skuId), eq(stockItemsTable.warehouseId, input.warehouseId), input.binId ? eq(stockItemsTable.binLocationId, input.binId) : isNull(stockItemsTable.binLocationId), eq(stockItemsTable.companyId, RequestContext.companyId(request))))
            .limit(1);
        if (!balance) {
            ApiResponse.ok(response, {
                valid: false,
                message: "No stock item found at this location",
                onHand: 0,
                averageCost: 0,
            });
            return;
        }
        ApiResponse.ok(response, {
            valid: true,
            stockItemId: balance.id,
            onHand: Number(balance.quantityOnHand || 0),
            averageCost: Number(balance.averageCost || 0),
        }, "Line validated");
    };
    command(type) {
        return async (request, response) => {
            const input = {
                companyId: RequestContext.companyId(request),
                adjustmentId: String(request.params.adjustmentId),
                actorId: RequestContext.userId(request),
            };
            const result = type === "approve"
                ? await this.approveUseCase.execute(input)
                : await this.rejectUseCase.execute(input);
            ApiResponse.ok(response, result, `Adjustment ${type}d`);
        };
    }
}

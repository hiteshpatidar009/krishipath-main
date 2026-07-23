import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { StockTransferValidator } from "./stock-transfer.validator";
export class StockTransferController {
    createUseCase;
    updateUseCase;
    transitionUseCase;
    listUseCase;
    getUseCase;
    preCheckUseCase;
    recentUseCase;
    nextNumberUseCase;
    submitUseCase;
    decideUseCase;
    receiveUseCase;
    addAttachmentUseCase;
    deleteAttachmentUseCase;
    getAttachmentsUseCase;
    getTimelineUseCase;
    recalculateRouteUseCase;
    getRiskAssessmentUseCase;
    constructor(createUseCase, updateUseCase, transitionUseCase, listUseCase, getUseCase, preCheckUseCase, recentUseCase, nextNumberUseCase, submitUseCase, decideUseCase, receiveUseCase, addAttachmentUseCase, deleteAttachmentUseCase, getAttachmentsUseCase, getTimelineUseCase, recalculateRouteUseCase, getRiskAssessmentUseCase) {
        this.createUseCase = createUseCase;
        this.updateUseCase = updateUseCase;
        this.transitionUseCase = transitionUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.preCheckUseCase = preCheckUseCase;
        this.recentUseCase = recentUseCase;
        this.nextNumberUseCase = nextNumberUseCase;
        this.submitUseCase = submitUseCase;
        this.decideUseCase = decideUseCase;
        this.receiveUseCase = receiveUseCase;
        this.addAttachmentUseCase = addAttachmentUseCase;
        this.deleteAttachmentUseCase = deleteAttachmentUseCase;
        this.getAttachmentsUseCase = getAttachmentsUseCase;
        this.getTimelineUseCase = getTimelineUseCase;
        this.recalculateRouteUseCase = recalculateRouteUseCase;
        this.getRiskAssessmentUseCase = getRiskAssessmentUseCase;
    }
    nextNumber = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const result = await this.nextNumberUseCase.execute(companyId);
        ApiResponse.ok(response, { nextNumber: result }, "Next number generated");
    };
    preCheck = async (request, response) => {
        const input = StockTransferValidator.preCheck.parse(request.body);
        const result = await this.preCheckUseCase.execute({
            companyId: RequestContext.companyId(request),
            sourceWarehouseId: input.sourceWarehouseId,
            items: input.items,
        });
        ApiResponse.ok(response, result, "Pre-check completed");
    };
    recent = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const limit = request.query.limit ? Number(request.query.limit) : 5;
        const result = await this.recentUseCase.execute(companyId, limit);
        ApiResponse.ok(response, result, "Recent transfers loaded");
    };
    create = async (request, response) => {
        const input = StockTransferValidator.create.parse(request.body);
        ApiResponse.created(response, await this.createUseCase.execute({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            idempotencyKey: String(request.header("idempotency-key") || request.body.idempotencyKey || `idemp-${Date.now()}`),
        }), "Transfer created");
    };
    update = async (request, response) => {
        const input = StockTransferValidator.update.parse(request.body);
        await this.updateUseCase.execute({
            ...input,
            transferId: String(request.params.transferId),
            companyId: RequestContext.companyId(request),
        });
        ApiResponse.ok(response, null, "Transfer updated");
    };
    list = async (request, response) => {
        const query = StockTransferValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.listUseCase.execute({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Transfers loaded");
    };
    get = async (request, response) => {
        ApiResponse.ok(response, await this.getUseCase.execute(RequestContext.companyId(request), String(request.params.transferId)), "Transfer loaded");
    };
    transition = (target) => async (request, response) => {
        ApiResponse.ok(response, await this.transitionUseCase.execute({
            companyId: RequestContext.companyId(request),
            transferId: String(request.params.transferId),
            actorId: RequestContext.userId(request),
        }, target), `Transfer transitioned to ${target}`);
    };
    submit = async (request, response) => {
        const result = await this.submitUseCase.execute({
            companyId: RequestContext.companyId(request),
            transferId: String(request.params.transferId),
            actorId: RequestContext.userId(request),
        });
        ApiResponse.ok(response, result, "Transfer submitted for approval");
    };
    decide = async (request, response) => {
        const input = StockTransferValidator.decide.parse(request.body);
        const result = await this.decideUseCase.execute({
            companyId: RequestContext.companyId(request),
            transferId: String(request.params.transferId),
            actorId: RequestContext.userId(request),
        }, input.decision, input.comments);
        ApiResponse.ok(response, result, `Decision submitted: ${input.decision}`);
    };
    approve = async (request, response) => {
        const comments = String(request.body.comments || "Approved");
        const result = await this.decideUseCase.execute({
            companyId: RequestContext.companyId(request),
            transferId: String(request.params.transferId),
            actorId: RequestContext.userId(request),
        }, "approve", comments);
        ApiResponse.ok(response, result, "Transfer approved");
    };
    reject = async (request, response) => {
        const comments = String(request.body.comments || "");
        if (!comments.trim()) {
            ApiResponse.badRequest(response, "Rejection comments are required");
            return;
        }
        const result = await this.decideUseCase.execute({
            companyId: RequestContext.companyId(request),
            transferId: String(request.params.transferId),
            actorId: RequestContext.userId(request),
        }, "reject", comments);
        ApiResponse.ok(response, result, "Transfer rejected");
    };
    receive = async (request, response) => {
        const input = StockTransferValidator.receive.parse(request.body);
        const result = await this.receiveUseCase.execute({
            companyId: RequestContext.companyId(request),
            transferId: String(request.params.transferId),
            actorId: RequestContext.userId(request),
        }, input.lines);
        ApiResponse.ok(response, result, "Items received");
    };
    recalculateRoute = async (request, response) => {
        const result = await this.recalculateRouteUseCase.execute(RequestContext.companyId(request), String(request.params.transferId), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Route recalculated");
    };
    getRiskAssessment = async (request, response) => {
        const result = await this.getRiskAssessmentUseCase.execute(RequestContext.companyId(request), String(request.params.transferId));
        ApiResponse.ok(response, result, "Risk assessment loaded");
    };
    addAttachment = async (request, response) => {
        const input = StockTransferValidator.attachment.parse(request.body);
        const result = await this.addAttachmentUseCase.execute(RequestContext.companyId(request), String(request.params.transferId), {
            ...input,
            uploadedBy: RequestContext.userId(request),
        });
        ApiResponse.created(response, result, "Attachment added");
    };
    deleteAttachment = async (request, response) => {
        await this.deleteAttachmentUseCase.execute(RequestContext.companyId(request), String(request.params.transferId), String(request.params.attachmentId), RequestContext.userId(request));
        ApiResponse.ok(response, null, "Attachment deleted");
    };
    getAttachments = async (request, response) => {
        const result = await this.getAttachmentsUseCase.execute(RequestContext.companyId(request), String(request.params.transferId));
        ApiResponse.ok(response, result, "Attachments loaded");
    };
    getTimeline = async (request, response) => {
        const result = await this.getTimelineUseCase.execute(RequestContext.companyId(request), String(request.params.transferId));
        ApiResponse.ok(response, result, "Timeline loaded");
    };
}

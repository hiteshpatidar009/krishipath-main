import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { QualityManagementValidator } from "../validators/quality-management.validator";
export class QualityManagementController {
    service;
    constructor(service) {
        this.service = service;
    }
    createRule = async (request, response) => {
        const input = QualityManagementValidator.rule.parse(request.body);
        ApiResponse.created(response, await this.service.createRule({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
        }), "Quality rule created");
    };
    listRules = async (request, response) => {
        ApiResponse.ok(response, await this.service.listRules(RequestContext.companyId(request)), "Quality rules loaded");
    };
    createChecklist = async (request, response) => {
        const input = QualityManagementValidator.checklist.parse(request.body);
        ApiResponse.created(response, await this.service.createChecklist({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
        }), "Quality checklist created");
    };
    listChecklists = async (request, response) => {
        ApiResponse.ok(response, await this.service.listChecklists(RequestContext.companyId(request)), "Quality checklists loaded");
    };
    createInspection = async (request, response) => {
        const input = QualityManagementValidator.inspection.parse(request.body);
        ApiResponse.created(response, await this.service.createInspection({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            idempotencyKey: String(request.header("idempotency-key") ?? ""),
        }), "Quality inspection created");
    };
    listInspections = async (request, response) => {
        const query = QualityManagementValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.service.listInspections({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Quality inspections loaded");
    };
    getInspection = async (request, response) => {
        const inspection = await this.service.getInspection(RequestContext.companyId(request), String(request.params.inspectionId));
        if (!inspection) {
            ApiResponse.notFound(response, "Quality inspection not found");
            return;
        }
        ApiResponse.ok(response, inspection, "Quality inspection loaded");
    };
    addDefect = async (request, response) => {
        const input = QualityManagementValidator.defect.parse(request.body);
        ApiResponse.created(response, await this.service.addDefect({
            ...input,
            companyId: RequestContext.companyId(request),
            inspectionId: String(request.params.inspectionId),
            createdBy: RequestContext.userId(request),
        }), "Quality defect recorded");
    };
    pass = this.decision("pass");
    fail = this.decision("fail");
    reject = this.decision("reject");
    quarantine = this.decision("quarantine");
    release = this.decision("release");
    summary = async (request, response) => {
        ApiResponse.ok(response, await this.service.summary(RequestContext.companyId(request)), "Quality summary loaded");
    };
    failureTrends = async (request, response) => {
        ApiResponse.ok(response, await this.service.failureTrends(RequestContext.companyId(request)), "Quality failure trends loaded");
    };
    supplierScore = async (request, response) => {
        ApiResponse.ok(response, await this.service.supplierScore(RequestContext.companyId(request)), "Supplier quality scores loaded");
    };
    warehouseScore = async (request, response) => {
        ApiResponse.ok(response, await this.service.warehouseScore(RequestContext.companyId(request)), "Warehouse quality scores loaded");
    };
    productScore = async (request, response) => {
        ApiResponse.ok(response, await this.service.productScore(RequestContext.companyId(request)), "Product quality scores loaded");
    };
    decision(action) {
        return async (request, response) => {
            const input = QualityManagementValidator.decision.parse(request.body);
            ApiResponse.ok(response, await this.service[action]({
                ...input,
                companyId: RequestContext.companyId(request),
                inspectionId: String(request.params.inspectionId),
                actorId: RequestContext.userId(request),
            }), `Quality inspection ${action} completed`);
        };
    }
}

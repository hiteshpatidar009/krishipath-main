import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { EnterpriseValidator } from "../validators/enterprise.validator";
export class EnterpriseController {
    service;
    constructor(service) {
        this.service = service;
    }
    list = async (request, response) => {
        const query = EnterpriseValidator.listQuery.parse(request.query);
        ApiResponse.ok(response, await this.service.list(RequestContext.userId(request), query), "Enterprises loaded");
    };
    get = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.get(params.enterpriseId, RequestContext.userId(request)), "Enterprise loaded");
    };
    create = async (request, response) => {
        const input = EnterpriseValidator.createEnterprise.parse(request.body);
        ApiResponse.created(response, await this.service.create({
            ...input,
            ownerUserId: RequestContext.userId(request),
            anchorCompanyId: RequestContext.companyId(request),
        }), "Enterprise created");
    };
    update = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.updateEnterprise.parse(request.body);
        ApiResponse.ok(response, await this.service.update({
            ...input,
            enterpriseId: params.enterpriseId,
            userId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Enterprise updated");
    };
    archive = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.archive(params.enterpriseId, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise archived");
    };
    activate = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.activate(params.enterpriseId, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise activated");
    };
    deactivate = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.deactivate(params.enterpriseId, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise deactivated");
    };
    move = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.moveEnterprise.parse(request.body);
        ApiResponse.ok(response, await this.service.move({
            enterpriseId: params.enterpriseId,
            parentEnterpriseId: input.parentEnterpriseId,
            userId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Enterprise moved");
    };
    hierarchyTree = async (request, response) => {
        const query = EnterpriseValidator.hierarchyQuery.parse(request.query);
        ApiResponse.ok(response, await this.service.hierarchyTree(RequestContext.userId(request), query.parentEnterpriseId === "root" ? null : query.parentEnterpriseId), "Enterprise hierarchy loaded");
    };
    getConfiguration = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.getConfiguration(params.enterpriseId, RequestContext.userId(request)), "Enterprise configuration loaded");
    };
    replaceConfiguration = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.configurationSettings.parse(request.body);
        ApiResponse.ok(response, await this.service.replaceConfiguration(params.enterpriseId, RequestContext.userId(request), RequestContext.companyId(request), input.settings), "Enterprise configuration updated");
    };
    inheritAllConfiguration = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.inheritAllConfiguration(params.enterpriseId, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise configuration inherited");
    };
    resetConfigurationOverride = async (request, response) => {
        const params = EnterpriseValidator.settingParams.parse(request.params);
        ApiResponse.ok(response, await this.service.resetConfigurationOverride(params.enterpriseId, params.settingKey, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise configuration override reset");
    };
    copyConfiguration = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.copyConfiguration.parse(request.body);
        ApiResponse.ok(response, await this.service.copyConfiguration(params.enterpriseId, input.sourceEnterpriseId, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise configuration copied");
    };
    listDocuments = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.listDocuments(params.enterpriseId, RequestContext.userId(request)), "Enterprise documents loaded");
    };
    addDocument = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.addDocument.parse(request.body);
        ApiResponse.created(response, await this.service.addDocument(params.enterpriseId, RequestContext.userId(request), RequestContext.companyId(request), input), "Enterprise document added");
    };
    deleteDocument = async (request, response) => {
        const params = EnterpriseValidator.documentParams.parse(request.params);
        ApiResponse.ok(response, await this.service.deleteDocument(params.enterpriseId, params.documentId, RequestContext.userId(request), RequestContext.companyId(request)), "Enterprise document deleted");
    };
    auditLogs = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.auditLogs(params.enterpriseId, RequestContext.userId(request)), "Enterprise audit logs loaded");
    };
    listCompanies = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.listCompanies(params.enterpriseId, RequestContext.userId(request)), "Enterprise companies loaded");
    };
    addCompany = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.addCompany.parse(request.body);
        ApiResponse.created(response, await this.service.addCompany({
            enterpriseId: params.enterpriseId,
            companyId: input.companyId,
            actorUserId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Enterprise company added");
    };
    removeCompany = async (request, response) => {
        const params = EnterpriseValidator.companyParams.parse(request.params);
        ApiResponse.ok(response, await this.service.removeCompany({
            enterpriseId: params.enterpriseId,
            companyId: params.companyId,
            actorUserId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Enterprise company removed");
    };
    listUsers = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.listUsers(params.enterpriseId, RequestContext.userId(request)), "Enterprise users loaded");
    };
    addUser = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.addUser.parse(request.body);
        ApiResponse.created(response, await this.service.addUser({
            enterpriseId: params.enterpriseId,
            userId: input.userId,
            role: input.role,
            actorUserId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Enterprise user added");
    };
    removeUser = async (request, response) => {
        const params = EnterpriseValidator.userParams.parse(request.params);
        ApiResponse.ok(response, await this.service.removeUser({
            enterpriseId: params.enterpriseId,
            userId: params.userId,
            role: "VIEWER",
            actorUserId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Enterprise user removed");
    };
    listTransfers = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const query = EnterpriseValidator.transferListQuery.parse(request.query);
        ApiResponse.ok(response, await this.service.listTransfers(params.enterpriseId, RequestContext.userId(request), query), "Intercompany transfers loaded");
    };
    getTransfer = async (request, response) => {
        const params = EnterpriseValidator.transferParams.parse(request.params);
        ApiResponse.ok(response, await this.service.getTransfer(params.enterpriseId, params.transferId, RequestContext.userId(request)), "Intercompany transfer loaded");
    };
    createTransfer = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.createTransfer.parse(request.body);
        ApiResponse.created(response, await this.service.createTransfer({
            ...input,
            enterpriseId: params.enterpriseId,
            createdBy: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Intercompany transfer created");
    };
    approveTransfer = async (request, response) => {
        const params = EnterpriseValidator.transferParams.parse(request.params);
        const input = EnterpriseValidator.transferDecision.parse(request.body);
        ApiResponse.ok(response, await this.service.approveTransfer({
            enterpriseId: params.enterpriseId,
            transferId: params.transferId,
            userId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
            comment: input.comment,
        }), "Intercompany transfer approved");
    };
    rejectTransfer = async (request, response) => {
        const params = EnterpriseValidator.transferParams.parse(request.params);
        const input = EnterpriseValidator.rejectTransfer.parse(request.body);
        ApiResponse.ok(response, await this.service.rejectTransfer({
            enterpriseId: params.enterpriseId,
            transferId: params.transferId,
            userId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
            comment: input.comment,
        }), "Intercompany transfer rejected");
    };
    submitTransfer = async (request, response) => {
        await this.transitionTransfer(request, response, "SUBMIT", "Intercompany transfer submitted");
    };
    dispatchTransfer = async (request, response) => {
        await this.transitionTransfer(request, response, "DISPATCH", "Intercompany transfer dispatched");
    };
    receiveTransfer = async (request, response) => {
        await this.transitionTransfer(request, response, "RECEIVE", "Intercompany transfer received");
    };
    completeTransfer = async (request, response) => {
        await this.transitionTransfer(request, response, "COMPLETE", "Intercompany transfer completed");
    };
    settleTransfer = async (request, response) => {
        await this.transitionTransfer(request, response, "SETTLE", "Intercompany transfer settled");
    };
    cancelTransfer = async (request, response) => {
        await this.transitionTransfer(request, response, "CANCEL", "Intercompany transfer cancelled");
    };
    listInvoices = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.listInvoices(params.enterpriseId, RequestContext.userId(request)), "Intercompany invoices loaded");
    };
    createInvoice = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        const input = EnterpriseValidator.createInvoice.parse(request.body);
        ApiResponse.created(response, await this.service.createInvoice({
            ...input,
            enterpriseId: params.enterpriseId,
            userId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
        }), "Intercompany invoice created");
    };
    reportingSummary = async (request, response) => {
        const params = EnterpriseValidator.idParams.parse(request.params);
        ApiResponse.ok(response, await this.service.reportingSummary(params.enterpriseId, RequestContext.userId(request)), "Enterprise reporting summary loaded");
    };
    async transitionTransfer(request, response, action, message) {
        const params = EnterpriseValidator.transferParams.parse(request.params);
        const input = EnterpriseValidator.transferTransition.parse(request.body);
        ApiResponse.ok(response, await this.service.transitionTransfer({
            enterpriseId: params.enterpriseId,
            transferId: params.transferId,
            userId: RequestContext.userId(request),
            contextCompanyId: RequestContext.companyId(request),
            action,
            comment: input.comment,
        }), message);
    }
}

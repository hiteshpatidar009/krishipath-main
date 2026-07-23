import { ApiResponse } from "../../../shared/http/api-response";
import { RequestContext } from "../../../shared/context/request-context";
import { UserValidator } from "./user.validator";
export class UserController {
    service;
    constructor(service) {
        this.service = service;
    }
    invite = async (request, response) => ApiResponse.created(response, await this.service.invite({ companyId: RequestContext.companyId(request), actorId: RequestContext.userId(request), ...UserValidator.invite.parse(request.body) }), "User invited");
    list = async (request, response) => {
        const query = UserValidator.query.parse(request.query);
        ApiResponse.ok(response, await this.service.list(RequestContext.companyId(request), query), "Users loaded");
    };
    exportDirectory = async (request, response) => {
        const query = UserValidator.query.parse(request.query);
        const csvContent = await this.service.exportDirectory(RequestContext.companyId(request), query);
        response.setHeader("Content-Type", "text/csv");
        response.setHeader("Content-Disposition", 'attachment; filename="users_export.csv"');
        response.status(200).send(csvContent);
    };
    getSummary = async (request, response) => ApiResponse.ok(response, await this.service.getSummary(RequestContext.companyId(request)), "User summary loaded");
    get = async (request, response) => ApiResponse.ok(response, await this.service.get(RequestContext.companyId(request), String(request.params.userId ?? "")), "User loaded");
    update = async (request, response) => ApiResponse.ok(response, await this.service.update(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.update.parse(request.body)), "User updated");
    assignRoles = async (request, response) => ApiResponse.ok(response, await this.service.assignRoles(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.assignRoles.parse(request.body)), "Roles assigned");
    activate = async (request, response) => ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), "active"), "User activated");
    suspend = async (request, response) => ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), "suspended"), "User suspended");
    restore = async (request, response) => ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), "active"), "User restored");
    preferences = async (request, response) => ApiResponse.ok(response, await this.service.preferences(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.preferences.parse(request.body)), "Preferences updated");
    listInvitations = async (request, response) => ApiResponse.ok(response, await this.service.listInvitations(RequestContext.companyId(request)), "Invitations loaded");
    resendInvitation = async (request, response) => ApiResponse.ok(response, await this.service.resendInvitation(RequestContext.companyId(request), String(request.params.id ?? ""), RequestContext.userId(request)), "Invitation resent");
    revokeInvitation = async (request, response) => ApiResponse.ok(response, await this.service.revokeInvitation(RequestContext.companyId(request), String(request.params.id ?? ""), RequestContext.userId(request)), "Invitation revoked");
    acceptInvitation = async (request, response) => {
        const payload = UserValidator.acceptInvitation.parse(request.body);
        const auth = RequestContext.auth(request);
        ApiResponse.ok(response, await this.service.acceptInvitation(payload.token, payload.password, auth?.userId), "Invitation accepted");
    };
    getInvitationByToken = async (request, response) => ApiResponse.ok(response, await this.service.getInvitationByToken(String(request.params.token ?? "")), "Invitation loaded");
    getUserSessions = async (request, response) => ApiResponse.ok(response, await this.service.getUserSessions(RequestContext.companyId(request), String(request.params.userId ?? "")), "User sessions loaded");
    getUserActivity = async (request, response) => ApiResponse.ok(response, await this.service.getUserActivity(RequestContext.companyId(request), String(request.params.userId ?? "")), "User activity loaded");
    getWarehouseAccess = async (request, response) => ApiResponse.ok(response, await this.service.getWarehouseAccess(RequestContext.companyId(request), String(request.params.userId ?? "")), "Warehouse access loaded");
    updateWarehouseAccess = async (request, response) => ApiResponse.ok(response, await this.service.updateWarehouseAccess(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.warehouseAccess.parse(request.body)), "Warehouse access updated");
    resetPassword = async (request, response) => ApiResponse.ok(response, await this.service.resetPassword(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request)), "Password reset initiated");
    resetMfa = async (request, response) => ApiResponse.ok(response, await this.service.resetMfa(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request)), "MFA reset completed");
    terminateSessions = async (request, response) => ApiResponse.ok(response, await this.service.terminateSessions(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request)), "Sessions terminated");
    bulkAction = async (request, response) => ApiResponse.ok(response, await this.service.bulkAction(RequestContext.companyId(request), RequestContext.userId(request), UserValidator.bulkAction.parse(request.body)), "Bulk action executed");
}

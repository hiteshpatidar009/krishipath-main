import { Request, Response } from "express";
import { ApiResponse } from "../../../shared/http/api-response";
import { RequestContext } from "../../../shared/context/request-context";
import { UserService } from "../application/user.service";
import { UserValidator } from "./user.validator";

export class UserController {
  public constructor(private readonly service: UserService) {}

  public invite = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.created(response, await this.service.invite({ companyId: RequestContext.companyId(request), actorId: RequestContext.userId(request), ...UserValidator.invite.parse(request.body) }), "User invited");

  public list = async (request: Request, response: Response): Promise<void> => {
    const query = UserValidator.query.parse(request.query);
    ApiResponse.ok(response, await this.service.list(RequestContext.companyId(request), query), "Users loaded");
  };

  public exportDirectory = async (request: Request, response: Response): Promise<void> => {
    const query = UserValidator.query.parse(request.query);
    const csvContent = await this.service.exportDirectory(RequestContext.companyId(request), query);
    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", 'attachment; filename="users_export.csv"');
    response.status(200).send(csvContent);
  };

  public getSummary = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.getSummary(RequestContext.companyId(request)), "User summary loaded");

  public get = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.get(RequestContext.companyId(request), String(request.params.userId ?? "")), "User loaded");

  public update = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.update(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.update.parse(request.body)), "User updated");

  public assignRoles = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.assignRoles(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.assignRoles.parse(request.body)), "Roles assigned");

  public activate = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), "active"), "User activated");

  public suspend = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), "suspended"), "User suspended");

  public restore = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), "active"), "User restored");

  public preferences = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.preferences(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.preferences.parse(request.body)), "Preferences updated");

  public listInvitations = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.listInvitations(RequestContext.companyId(request)), "Invitations loaded");

  public resendInvitation = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.resendInvitation(RequestContext.companyId(request), String(request.params.id ?? ""), RequestContext.userId(request)), "Invitation resent");

  public revokeInvitation = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.revokeInvitation(RequestContext.companyId(request), String(request.params.id ?? ""), RequestContext.userId(request)), "Invitation revoked");

  public acceptInvitation = async (request: Request, response: Response): Promise<void> => {
    const payload = UserValidator.acceptInvitation.parse(request.body);
    const auth = RequestContext.auth(request);
    ApiResponse.ok(
      response,
      await this.service.acceptInvitation(payload.token, payload.password, auth?.userId),
      "Invitation accepted"
    );
  };

  public getInvitationByToken = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.getInvitationByToken(String(request.params.token ?? "")), "Invitation loaded");

  public getUserSessions = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.getUserSessions(RequestContext.companyId(request), String(request.params.userId ?? "")), "User sessions loaded");

  public getUserActivity = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.getUserActivity(RequestContext.companyId(request), String(request.params.userId ?? "")), "User activity loaded");

  public getWarehouseAccess = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.getWarehouseAccess(RequestContext.companyId(request), String(request.params.userId ?? "")), "Warehouse access loaded");

  public updateWarehouseAccess = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.updateWarehouseAccess(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request), UserValidator.warehouseAccess.parse(request.body)), "Warehouse access updated");

  public resetPassword = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.resetPassword(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request)), "Password reset initiated");

  public resetMfa = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.resetMfa(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request)), "MFA reset completed");

  public terminateSessions = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.terminateSessions(RequestContext.companyId(request), String(request.params.userId ?? ""), RequestContext.userId(request)), "Sessions terminated");

  public bulkAction = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.bulkAction(RequestContext.companyId(request), RequestContext.userId(request), UserValidator.bulkAction.parse(request.body)), "Bulk action executed");
}

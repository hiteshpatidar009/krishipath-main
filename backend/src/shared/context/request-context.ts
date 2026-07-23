import { Request } from "express";
import { AuthContext } from "../../modules/auth/types/ctx.type";
import { AppError } from "../errors/app.error";
import { SecurityRequest } from "../security";

export class RequestContext {
  public static userId(request: Request): string {
    const auth = this.auth(request);
    if (!auth?.userId) {
      throw new AppError("Authenticated user missing", 401, "AUTH_USER_MISSING");
    }
    return auth.userId;
  }

  public static companyId(request: Request): string {
    const auth = this.auth(request);
    if (!auth?.companyId) {
      throw new AppError("Company context missing", 403, "COMPANY_CONTEXT_MISSING");
    }
    return auth.companyId;
  }

  public static auth(request: Request): AuthContext | undefined {
    const authRequest = request as Request & { auth?: AuthContext };
    if (authRequest.auth) {
      return authRequest.auth;
    }

    const securityRequest = request as SecurityRequest;
    if (!securityRequest.securityContext) {
      return undefined;
    }

    if (
      !securityRequest.securityContext.userId ||
      !securityRequest.securityContext.sessionId ||
      !securityRequest.securityContext.accessLevel
    ) {
      return undefined;
    }

    return {
      userId: securityRequest.securityContext.userId,
      companyId: securityRequest.securityContext.companyId,
      sessionId: securityRequest.securityContext.sessionId,
      accessLevel: securityRequest.securityContext.accessLevel,
      isRoot: securityRequest.securityContext.isRoot,
      authType: securityRequest.securityContext.authType,
    };
  }

  public static requestId(request: Request): string | undefined {
    return (request as Request & { requestId?: string }).requestId;
  }
}

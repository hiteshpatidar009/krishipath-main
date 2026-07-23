import { AppError } from "../errors/app.error";
export class RequestContext {
    static userId(request) {
        const auth = this.auth(request);
        if (!auth?.userId) {
            throw new AppError("Authenticated user missing", 401, "AUTH_USER_MISSING");
        }
        return auth.userId;
    }
    static companyId(request) {
        const auth = this.auth(request);
        if (!auth?.companyId) {
            throw new AppError("Company context missing", 403, "COMPANY_CONTEXT_MISSING");
        }
        return auth.companyId;
    }
    static auth(request) {
        const authRequest = request;
        if (authRequest.auth) {
            return authRequest.auth;
        }
        const securityRequest = request;
        if (!securityRequest.securityContext) {
            return undefined;
        }
        if (!securityRequest.securityContext.userId ||
            !securityRequest.securityContext.sessionId ||
            !securityRequest.securityContext.accessLevel) {
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
    static requestId(request) {
        return request.requestId;
    }
}

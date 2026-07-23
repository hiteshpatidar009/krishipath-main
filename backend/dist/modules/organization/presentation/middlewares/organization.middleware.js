import { logger } from "../../../../infrastructure/logger";
import { RequestContext } from "../../../../shared/context/request-context";
export class OrgAuthMiddleware {
    static use(request, response, next) {
        try {
            RequestContext.userId(request);
            RequestContext.companyId(request);
            next();
        }
        catch {
            response.status(401).json({ success: false, message: "Organization auth failed" });
        }
    }
}
export class OrgScopeMiddleware {
    static use(request, response, next) {
        const organizationId = request.params.organizationId ?? request.header("x-organization-id");
        if (!organizationId) {
            response.status(403).json({ success: false, message: "Organization scope required" });
            return;
        }
        request.organizationId = String(organizationId);
        next();
    }
}
export class OrgMembershipMiddleware {
    static use(_request, _response, next) {
        next();
    }
}
export class OrgIsolationMiddleware {
    static use(request, response, next) {
        try {
            RequestContext.companyId(request);
            next();
        }
        catch {
            response.status(403).json({ success: false, message: "Company isolation failed" });
        }
    }
}
export class OrgAuditMiddleware {
    static async use(request, _response, next) {
        await logger.info("Organization request received", {
            module: "organization",
            companyId: RequestContext.auth(request)?.companyId,
            userId: RequestContext.auth(request)?.userId,
            tags: ["organization", "request"],
            payload: {
                path: request.path,
                method: request.method,
                ip: request.ip,
                requestId: RequestContext.requestId(request),
            },
        });
        next();
    }
}
export class OrgSuspiciousActivityMiddleware {
    static async use(request, _response, next) {
        if (request.path.includes("..")) {
            await logger.warn("Suspicious organization access detected", {
                module: "organization",
                companyId: RequestContext.auth(request)?.companyId,
                userId: RequestContext.auth(request)?.userId,
                tags: ["organization", "security", "suspicious"],
                payload: { path: request.path, ip: request.ip },
            });
        }
        next();
    }
}

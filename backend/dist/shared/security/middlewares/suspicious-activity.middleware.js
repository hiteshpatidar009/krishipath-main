import { logger } from "../../../infrastructure/logger";
import { RequestContext } from "../../context/request-context";
export class SuspiciousActivityMiddleware {
    static async use(request, _response, next) {
        const userAgent = request.header("user-agent") ?? "";
        const suspicious = !userAgent ||
            userAgent.length > 512 ||
            request.path.includes("..") ||
            /<script|union\s+select/i.test(JSON.stringify(request.body ?? {}));
        if (suspicious) {
            await logger.warn("Suspicious request detected", {
                module: "shared.security",
                companyId: RequestContext.auth(request)?.companyId,
                userId: RequestContext.auth(request)?.userId,
                tags: ["security", "suspicious", "request"],
                payload: {
                    path: request.path,
                    method: request.method,
                    ip: request.ip,
                    userAgent,
                },
            });
        }
        next();
    }
}

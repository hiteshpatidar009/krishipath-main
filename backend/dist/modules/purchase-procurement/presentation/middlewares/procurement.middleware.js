import { logger } from "../../../../infrastructure/logger";
import { RequestContext } from "../../../../shared/context/request-context";
export class ProcurementAuthMiddleware {
    static use(request, response, next) {
        try {
            RequestContext.userId(request);
            RequestContext.companyId(request);
            next();
        }
        catch (error) {
            response.status(401).json({ success: false, message: "Procurement auth failed" });
        }
    }
}
export class ProcurementScopeMiddleware {
    static requireCompany(request, response, next) {
        try {
            RequestContext.companyId(request);
            next();
        }
        catch {
            response.status(403).json({ success: false, message: "Company scope required" });
        }
    }
}
export class SupplierAccessMiddleware {
    static use(_request, _response, next) {
        next();
    }
}
export class ApprovalValidationMiddleware {
    static use(_request, _response, next) {
        next();
    }
}
export class ProcurementAuditMiddleware {
    static async use(request, _response, next) {
        await logger.info("Procurement request received", {
            module: "purchase-procurement",
            companyId: RequestContext.auth(request)?.companyId,
            userId: RequestContext.auth(request)?.userId,
            tags: ["procurement", "request"],
            payload: {
                method: request.method,
                path: request.path,
                requestId: RequestContext.requestId(request),
                ip: request.ip,
            },
        });
        next();
    }
}
export class RequestIntegrityMiddleware {
    static use(request, response, next) {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
            const idempotencyKey = request.header("idempotency-key");
            if (!idempotencyKey || idempotencyKey.length < 12) {
                response.status(400).json({
                    success: false,
                    message: "Valid idempotency-key header required",
                });
                return;
            }
        }
        next();
    }
}
export class ConcurrencyMiddleware {
    static use(request, response, next) {
        if (["PUT", "PATCH", "DELETE"].includes(request.method) && !request.header("if-match")) {
            response.status(428).json({ success: false, message: "if-match header required" });
            return;
        }
        next();
    }
}
export class AntiDuplicationMiddleware {
    static use(_request, _response, next) {
        next();
    }
}
export class TransactionBoundaryMiddleware {
    static use(_request, _response, next) {
        next();
    }
}

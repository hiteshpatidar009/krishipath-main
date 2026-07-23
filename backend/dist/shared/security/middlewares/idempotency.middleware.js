import { IdempotencyService } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { RequestContext } from "../../context/request-context";
export class IdempotencyMiddleware {
    static service = new IdempotencyService();
    static requireForMutations() {
        return IdempotencyMiddleware.handleMutations({ requireHeader: true, ttlMinutes: 60 });
    }
    static optionalForMutations(ttlMinutes = 1) {
        return IdempotencyMiddleware.handleMutations({ requireHeader: false, ttlMinutes });
    }
    static handleMutations(options) {
        return async (request, response, next) => {
            if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
                next();
                return;
            }
            const providedKey = request.header("idempotency-key");
            const key = providedKey ?? IdempotencyMiddleware.service.hashRequest({
                scope: "auto-idempotency",
                path: request.path,
                method: request.method,
                body: request.body,
                ipAddress: request.ip,
                userAgent: request.header("user-agent") ?? "",
                bucket: Math.floor(Date.now() / 10000),
            });
            if (!key || key.length < 12) {
                response.status(400).json({
                    success: false,
                    message: "idempotency-key header required",
                });
                return;
            }
            if (!providedKey && options.requireHeader) {
                response.status(400).json({
                    success: false,
                    message: "idempotency-key header required",
                });
                return;
            }
            const companyId = RequestContext.auth(request)?.companyId;
            const requestHash = IdempotencyMiddleware.service.hashRequest({
                path: request.path,
                method: request.method,
                body: request.body,
            });
            let reservation = await IdempotencyMiddleware.service.reserveExecution(companyId, key, requestHash, options.ttlMinutes);
            if (reservation.state === "conflict") {
                response.status(409).json({
                    success: false,
                    message: "Idempotency key reused with different payload",
                });
                return;
            }
            if (reservation.state === "completed") {
                await logger.info("idempotency replayed completed response", {
                    module: "idempotency",
                    companyId,
                    requestId: request.requestId,
                    payload: { key, path: request.originalUrl, method: request.method },
                });
                response.status(reservation.statusCode).json(reservation.responseSnapshot);
                return;
            }
            if (reservation.state === "in_progress") {
                await logger.warn("idempotency duplicate request in progress", {
                    module: "idempotency",
                    companyId,
                    requestId: request.requestId,
                    payload: { key, path: request.originalUrl, method: request.method },
                });
                response.status(409).json({
                    success: false,
                    message: "Request already in progress",
                    code: "IDEMPOTENCY_IN_PROGRESS",
                });
                return;
            }
            if (reservation.state === "failed") {
                if (!providedKey) {
                    const retried = await IdempotencyMiddleware.service.retryFailed(companyId, key, requestHash, options.ttlMinutes);
                    if (retried) {
                        reservation = { state: "reserved" };
                    }
                }
            }
            if (reservation.state === "failed") {
                await logger.warn("idempotency duplicate failed request", {
                    module: "idempotency",
                    companyId,
                    requestId: request.requestId,
                    payload: { key, path: request.originalUrl, method: request.method },
                });
                response.status(409).json({
                    success: false,
                    message: "Previous request failed. Retry with a new idempotency key.",
                    code: "IDEMPOTENCY_FAILED",
                });
                return;
            }
            const originalJson = response.json.bind(response);
            response.json = ((body) => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    void IdempotencyMiddleware.service.complete(companyId, key, requestHash, response.statusCode, body);
                }
                else {
                    void IdempotencyMiddleware.service.fail(companyId, key, requestHash);
                }
                return originalJson(body);
            });
            next();
        };
    }
}

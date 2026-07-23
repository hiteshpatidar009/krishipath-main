import { IdempotencyMiddleware } from "../../../shared/security";
export class BillingIdempotencyMiddleware {
    static requireForUnsafe(request, response, next) {
        const key = request.header("Idempotency-Key");
        if (!key || key.trim().length < 8 || key.length > 150) {
            response.status(400).json({
                success: false,
                message: "Idempotency-Key header is required for billing mutations",
            });
            return;
        }
        return IdempotencyMiddleware.requireForMutations()(request, response, next);
    }
}

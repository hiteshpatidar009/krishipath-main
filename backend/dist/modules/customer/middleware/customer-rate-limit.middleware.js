export class CustomerRateLimitMiddleware {
    static hits = new Map();
    static windowMs = 60_000;
    static maxRequests = 120;
    static use(request, response, next) {
        const key = `${request.securityContext?.companyId ?? "anonymous"}:${request.ip}`;
        const now = Date.now();
        const current = CustomerRateLimitMiddleware.hits.get(key);
        if (!current || current.resetAt <= now) {
            CustomerRateLimitMiddleware.hits.set(key, { count: 1, resetAt: now + CustomerRateLimitMiddleware.windowMs });
            next();
            return;
        }
        if (current.count >= CustomerRateLimitMiddleware.maxRequests) {
            response.status(429).json({
                success: false,
                code: "RATE_LIMIT_EXCEEDED",
                message: "Too many customer requests",
                errors: [],
            });
            return;
        }
        current.count += 1;
        next();
    }
}

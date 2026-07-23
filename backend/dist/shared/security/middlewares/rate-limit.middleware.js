import { logger } from "../../../infrastructure/logger";
import { SecurityConstants } from "../constants/security.constants";
export class RateLimitMiddleware {
    static buckets = new Map();
    static use(options) {
        const resolved = {
            scope: options?.scope ?? "global",
            maxRequests: options?.maxRequests ?? SecurityConstants.defaultRateLimit,
            windowSeconds: options?.windowSeconds ?? SecurityConstants.rateWindowSeconds,
        };
        return (request, response, next) => {
            const identifier = `${resolved.scope}:${request.ip ?? "unknown"}`;
            const now = Date.now();
            const current = RateLimitMiddleware.buckets.get(identifier);
            if (!current || current.resetAt <= now) {
                RateLimitMiddleware.buckets.set(identifier, {
                    count: 1,
                    resetAt: now + resolved.windowSeconds * 1000,
                });
                next();
                return;
            }
            current.count += 1;
            if (current.count > resolved.maxRequests) {
                void logger.warn("Rate limit exceeded", {
                    module: "shared.security.rate-limit",
                    ipAddress: request.ip,
                    method: request.method,
                    route: request.originalUrl,
                    tags: ["security", "rate-limit", "blocked"],
                });
                response.status(429).json({
                    success: false,
                    message: "Too many requests",
                    retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
                });
                return;
            }
            next();
        };
    }
}

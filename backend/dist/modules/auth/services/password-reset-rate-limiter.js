import { AuthError } from "../errors/auth.error";
export class PasswordResetRateLimiter {
    static buckets = new Map();
    assertWithinLimit(scope, identifier, maxRequests, windowSeconds) {
        const normalizedIdentifier = (identifier ?? "unknown").trim().toLowerCase();
        const key = `${scope}:${normalizedIdentifier}`;
        const now = Date.now();
        const current = PasswordResetRateLimiter.buckets.get(key);
        if (!current || current.resetAt <= now) {
            PasswordResetRateLimiter.buckets.set(key, {
                count: 1,
                resetAt: now + windowSeconds * 1000,
            });
            return;
        }
        current.count += 1;
        if (current.count > maxRequests) {
            throw new AuthError(429, "Too many password reset attempts. Please try again later.");
        }
    }
    static reset() {
        PasswordResetRateLimiter.buckets.clear();
    }
}

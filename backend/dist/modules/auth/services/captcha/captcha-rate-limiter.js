import { CaptchaConstants } from "./captcha.constants";
export class CaptchaRateLimiter {
    static buckets = new Map();
    static assertWithinLimit(scope, identifier, maxRequests) {
        const key = `${scope}:${identifier}`;
        const now = Date.now();
        const current = CaptchaRateLimiter.buckets.get(key);
        if (!current || current.resetAt <= now) {
            CaptchaRateLimiter.buckets.set(key, {
                count: 1,
                resetAt: now + CaptchaConstants.rateWindowSeconds * 1000,
            });
            return;
        }
        current.count += 1;
        if (current.count > maxRequests) {
            throw new Error("CAPTCHA_RATE_LIMIT_EXCEEDED");
        }
    }
    static reset() {
        CaptchaRateLimiter.buckets.clear();
    }
}

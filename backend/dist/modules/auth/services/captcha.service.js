import { AuthError } from "../errors/auth.error";
import { CaptchaConfig } from "./captcha/captcha.config";
import { CaptchaConstants } from "./captcha/captcha.constants";
import { CaptchaProviderFactory } from "./captcha/captcha-provider.factory";
import { CaptchaRateLimiter } from "./captcha/captcha-rate-limiter";
import { logger } from "../../../infrastructure/logger";
export class CaptchaService {
    provider;
    constructor() {
        this.provider = CaptchaProviderFactory.create();
    }
    async start(remoteIp) {
        this.assertGenerationRateLimit(remoteIp);
        return this.provider.start();
    }
    async verify(token, remoteIp) {
        this.assertValidationRateLimit(remoteIp);
        const context = { remoteIp };
        const valid = await this.provider.verify(token, context);
        if (!valid) {
            await logger.warn("CAPTCHA verification failed", {
                module: "auth.captcha",
                tags: ["auth", "captcha", "verification-failed"],
                ipAddress: remoteIp,
                payload: {
                    provider: CaptchaConfig.usesTurnstile()
                        ? "cloudflare_turnstile"
                        : "development_captcha",
                },
            });
        }
        return valid;
    }
    extractCaptchaValue(input) {
        return CaptchaConfig.extractCaptchaValue(input);
    }
    assertGenerationRateLimit(remoteIp) {
        try {
            CaptchaRateLimiter.assertWithinLimit("generation", remoteIp ?? "unknown", CaptchaConstants.generationRateLimit);
        }
        catch {
            throw new AuthError(429, "Too many CAPTCHA generation requests");
        }
    }
    assertValidationRateLimit(remoteIp) {
        try {
            CaptchaRateLimiter.assertWithinLimit("validation", remoteIp ?? "unknown", CaptchaConstants.validationRateLimit);
        }
        catch {
            throw new AuthError(429, "Too many CAPTCHA validation requests");
        }
    }
}

import axios from "axios";
import { env } from "../../../../infrastructure/config/env";
import { logger } from "../../../../infrastructure/logger";
export class TurnstileCaptchaProvider {
    async start() {
        return {
            provider: "cloudflare_turnstile",
            tokenField: "captchaToken",
            verificationRequired: true,
        };
    }
    async verify(token, context) {
        const secret = env.cloudflareTurnstileSecretKey;
        if (!secret) {
            throw new Error("Cloudflare Turnstile secret key not configured");
        }
        if (!token?.trim()) {
            await this.logVerificationFailure("missing_token", context?.remoteIp);
            return false;
        }
        const form = new URLSearchParams();
        form.set("secret", secret);
        form.set("response", token.trim());
        if (context?.remoteIp) {
            form.set("remoteip", context.remoteIp);
        }
        const response = await axios.post(env.cloudflareTurnstileVerifyUrl, form, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: env.externalHttpTimeoutMs,
            validateStatus: () => true,
        });
        if (response.status >= 400) {
            await logger.warn("Turnstile verification HTTP failure", {
                module: "auth.captcha",
                tags: ["auth", "captcha", "turnstile", "http-failure"],
                payload: { status: response.status },
                ipAddress: context?.remoteIp,
            });
            return false;
        }
        const valid = response.data.success === true;
        if (!valid) {
            await this.logVerificationFailure("turnstile_rejected", context?.remoteIp, response.data["error-codes"] ?? []);
        }
        return valid;
    }
    async logVerificationFailure(reason, remoteIp, errorCodes = []) {
        await logger.warn("Turnstile verification failed", {
            module: "auth.captcha",
            tags: ["auth", "captcha", "turnstile", "failed"],
            payload: { reason, errorCodes },
            ipAddress: remoteIp,
        });
    }
}

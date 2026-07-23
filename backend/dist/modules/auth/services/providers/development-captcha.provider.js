import { createHash, randomBytes } from "crypto";
import { env } from "../../../../infrastructure/config/env";
import { logger } from "../../../../infrastructure/logger";
import { CaptchaConstants } from "../captcha/captcha.constants";
export class DevelopmentCaptchaProvider {
    challenges = new Map();
    async start() {
        const code = this.generateCode();
        const codeHash = this.hashCode(code);
        const challenge = {
            codeHash,
            expiresAt: new Date(Date.now() + CaptchaConstants.developmentCodeTtlMinutes * 60 * 1000),
        };
        this.challenges.set(codeHash, challenge);
        this.cleanupExpired();
        await logger.info("Development CAPTCHA generated", {
            module: "auth.captcha",
            tags: ["auth", "captcha", "development", "start"],
        });
        return {
            provider: "development_captcha",
            captchaCode: code,
            tokenField: "captchaCode",
            verificationRequired: true,
        };
    }
    async verify(value, context) {
        if (!value?.trim()) {
            await this.logFailedAttempt("missing", context?.remoteIp);
            return false;
        }
        const normalized = value.trim().toUpperCase();
        const codeHash = this.hashCode(normalized);
        const challenge = this.challenges.get(codeHash);
        if (!challenge) {
            await this.logFailedAttempt("not_found", context?.remoteIp);
            return false;
        }
        if (challenge.expiresAt < new Date()) {
            this.challenges.delete(codeHash);
            await logger.warn("Development CAPTCHA expired", {
                module: "auth.captcha",
                tags: ["auth", "captcha", "development", "expired"],
                ipAddress: context?.remoteIp,
            });
            return false;
        }
        this.challenges.delete(codeHash);
        await logger.info("Development CAPTCHA verified", {
            module: "auth.captcha",
            tags: ["auth", "captcha", "development", "success"],
            ipAddress: context?.remoteIp,
        });
        return true;
    }
    async logFailedAttempt(reason, remoteIp) {
        await logger.warn("Development CAPTCHA verification failed", {
            module: "auth.captcha",
            tags: ["auth", "captcha", "development", "failed"],
            payload: { reason },
            ipAddress: remoteIp,
        });
    }
    hashCode(code) {
        return createHash("sha256")
            .update(code.toUpperCase())
            .update(env.jwtAccessSecretKey)
            .digest("hex");
    }
    generateCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const bytes = randomBytes(CaptchaConstants.developmentCodeLength);
        let code = "";
        for (let i = 0; i < CaptchaConstants.developmentCodeLength; i++) {
            code += chars[bytes[i] % chars.length];
        }
        return code;
    }
    cleanupExpired() {
        const now = new Date();
        for (const [codeHash, challenge] of this.challenges.entries()) {
            if (challenge.expiresAt < now) {
                this.challenges.delete(codeHash);
            }
        }
    }
}

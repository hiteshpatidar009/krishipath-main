import { randomUUID } from "crypto";
import { RedisService } from "../../../infrastructure/database/redis/redis.service";
import { CACHE_TTL_SECONDS } from "../../../infrastructure/database/redis/cache.ttl";
import { environmentService } from "../../../shared/environment";
import { OtpService } from "./otp.service";
export class MfaService {
    redis;
    otp;
    constructor() {
        this.redis = new RedisService();
        this.otp = new OtpService();
    }
    async issueChallenge(userId, companyId, method, purpose, target, context) {
        const id = randomUUID();
        const expiresAt = Date.now() + CACHE_TTL_SECONDS.fiveMinutes * 1000;
        const maxAttempts = method === "auth_app_otp" ? 5 : 3;
        if (method === "auth_app_otp") {
            const challenge = {
                id,
                userId,
                companyId,
                ...context,
                method,
                purpose,
                target,
                expiresAt,
                attempts: 0,
                maxAttempts,
            };
            await this.redis.set(this.key(id), challenge, CACHE_TTL_SECONDS.fiveMinutes);
            return { challenge };
        }
        const code = this.otp.generateCode();
        const challenge = {
            id,
            userId,
            companyId,
            ...context,
            method,
            purpose,
            target,
            codeHash: this.otp.hash(code),
            expiresAt,
            attempts: 0,
            maxAttempts,
        };
        await this.redis.set(this.key(id), challenge, CACHE_TTL_SECONDS.fiveMinutes);
        return { challenge, code };
    }
    async issueReplacementChallenge(userId, companyId, method, purpose, target, context) {
        const latestKey = this.latestKey(userId, purpose);
        const previousChallengeId = await this.redis.get(latestKey);
        if (previousChallengeId) {
            await this.clearChallenge(previousChallengeId);
        }
        const issued = await this.issueChallenge(userId, companyId, method, purpose, target, context);
        await this.redis.set(latestKey, issued.challenge.id, CACHE_TTL_SECONDS.fiveMinutes);
        return issued;
    }
    async getChallenge(challengeId) {
        const challenge = await this.redis.get(this.key(challengeId));
        return this.isChallenge(challenge) ? challenge : null;
    }
    async getLatestChallenge(userId, purpose) {
        const challengeId = await this.redis.get(this.latestKey(userId, purpose));
        if (!challengeId) {
            return null;
        }
        return this.getChallenge(challengeId);
    }
    async clearChallenge(challengeId) {
        await this.redis.del(this.key(challengeId));
    }
    async listChallengeKeys() {
        if (!environmentService.exposeDebugMetadata()) {
            return [];
        }
        return this.redis.keys("auth:mfa:challenge:*");
    }
    async findMatchingChallenge(userId, purpose, code) {
        const keys = await this.redis.keys("auth:mfa:challenge:*");
        for (const key of keys) {
            const challengeId = key.substring(key.lastIndexOf(":") + 1);
            const challenge = await this.getChallenge(challengeId);
            if (challenge &&
                challenge.userId === userId &&
                challenge.purpose === purpose &&
                challenge.codeHash &&
                challenge.expiresAt >= Date.now() &&
                this.verifyCode(code, challenge.codeHash)) {
                return challenge;
            }
        }
        return null;
    }
    async verifyOtpChallenge(input) {
        const challenge = await this.getChallenge(input.challengeId);
        if (!this.matchesChallenge(input, challenge)) {
            return { status: "invalid_challenge" };
        }
        if (!challenge.codeHash) {
            return { status: "invalid_challenge" };
        }
        const maxAttempts = challenge.maxAttempts ?? 3;
        const currentAttempts = challenge.attempts ?? 0;
        if (currentAttempts >= maxAttempts) {
            await this.clearChallenge(challenge.id);
            return { status: "invalid_challenge" };
        }
        if (this.verifyCode(input.code, challenge.codeHash)) {
            return { status: "verified", challenge };
        }
        // Increment attempts
        challenge.attempts = currentAttempts + 1;
        const ttlSeconds = Math.ceil((challenge.expiresAt - Date.now()) / 1000);
        if (challenge.attempts >= maxAttempts) {
            await this.clearChallenge(challenge.id);
            return { status: "attempts_exhausted", challenge };
        }
        if (ttlSeconds > 0) {
            await this.redis.set(this.key(challenge.id), challenge, ttlSeconds);
        }
        else {
            await this.clearChallenge(challenge.id);
            return { status: "invalid_challenge" };
        }
        if (!input.allowMatchingCode || !input.userId) {
            return { status: "invalid_code", challenge };
        }
        const matchingChallenge = await this.findMatchingChallenge(input.userId, input.purpose, input.code);
        if (!this.matchesChallenge(input, matchingChallenge)) {
            return { status: "invalid_code", challenge };
        }
        return { status: "verified", challenge: matchingChallenge };
    }
    async saveChallenge(challenge, ttlSeconds) {
        await this.redis.set(this.key(challenge.id), challenge, ttlSeconds);
    }
    verifyCode(code, codeHash) {
        return this.otp.equals(code, codeHash);
    }
    key(challengeId) {
        return `auth:mfa:challenge:${challengeId}`;
    }
    latestKey(userId, purpose) {
        return `auth:mfa:latest:${purpose}:${userId}`;
    }
    matchesChallenge(input, challenge) {
        return Boolean(challenge &&
            (!input.userId || challenge.userId === input.userId) &&
            (!input.method || challenge.method === input.method) &&
            challenge.purpose === input.purpose &&
            (!input.target || challenge.target === input.target) &&
            challenge.expiresAt >= Date.now());
    }
    isChallenge(value) {
        if (!value || typeof value !== "object") {
            return false;
        }
        const challenge = value;
        return (typeof challenge.id === "string" &&
            typeof challenge.userId === "string" &&
            typeof challenge.method === "string" &&
            typeof challenge.purpose === "string");
    }
}

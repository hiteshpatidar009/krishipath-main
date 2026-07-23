import { randomUUID } from "crypto";

import { RedisService } from "../../../infrastructure/database/redis/redis.service";
import { CACHE_TTL_SECONDS } from "../../../infrastructure/database/redis/cache.ttl";
import { environmentService } from "../../../shared/environment";
import { OtpService } from "./otp.service";

interface MfaChallenge {
  id: string;
  userId: string;
  companyId?: string;
  selectedCompanyId?: string;
  isRoot?: boolean;
  authType?: "root" | "iam";
  method: "email_otp" | "phone_otp" | "auth_app_otp";
  purpose:
    | "login"
    | "login_primary"
    | "setup"
    | "email_verify"
    | "phone_verify"
    | "password_setup";
  target?: string;
  codeHash?: string;
  expiresAt: number;
  attempts?: number;
  maxAttempts?: number;
}

type VerifyOtpChallengeResult =
  | { status: "verified"; challenge: MfaChallenge }
  | { status: "invalid_challenge" }
  | { status: "attempts_exhausted"; challenge: MfaChallenge }
  | { status: "invalid_code"; challenge: MfaChallenge };

export class MfaService {
  private readonly redis: RedisService;
  private readonly otp: OtpService;

  constructor() {
    this.redis = new RedisService();
    this.otp = new OtpService();
  }

  public async issueChallenge(
    userId: string,
    companyId: string | undefined,
    method: "email_otp" | "phone_otp" | "auth_app_otp",
    purpose: MfaChallenge["purpose"],
    target?: string,
    context?: {
      selectedCompanyId?: string;
      isRoot?: boolean;
      authType?: "root" | "iam";
    },
  ): Promise<{ challenge: MfaChallenge; code?: string }> {
    const id = randomUUID();
    const expiresAt = Date.now() + CACHE_TTL_SECONDS.fiveMinutes * 1000;
    const maxAttempts = method === "auth_app_otp" ? 5 : 3;

    if (method === "auth_app_otp") {
      const challenge: MfaChallenge = {
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
    const challenge: MfaChallenge = {
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

  public async issueReplacementChallenge(
    userId: string,
    companyId: string | undefined,
    method: "email_otp" | "phone_otp" | "auth_app_otp",
    purpose: MfaChallenge["purpose"],
    target?: string,
    context?: {
      selectedCompanyId?: string;
      isRoot?: boolean;
      authType?: "root" | "iam";
    },
  ): Promise<{ challenge: MfaChallenge; code?: string }> {
    const latestKey = this.latestKey(userId, purpose);
    const previousChallengeId = await this.redis.get<string>(latestKey);

    if (previousChallengeId) {
      await this.clearChallenge(previousChallengeId);
    }

    const issued = await this.issueChallenge(
      userId,
      companyId,
      method,
      purpose,
      target,
      context,
    );
    await this.redis.set(
      latestKey,
      issued.challenge.id,
      CACHE_TTL_SECONDS.fiveMinutes,
    );

    return issued;
  }

  public async getChallenge(challengeId: string): Promise<MfaChallenge | null> {
    const challenge = await this.redis.get<MfaChallenge>(this.key(challengeId));
    return this.isChallenge(challenge) ? challenge : null;
  }

  public async getLatestChallenge(
    userId: string,
    purpose: MfaChallenge["purpose"],
  ): Promise<MfaChallenge | null> {
    const challengeId = await this.redis.get<string>(this.latestKey(userId, purpose));
    if (!challengeId) {
      return null;
    }

    return this.getChallenge(challengeId);
  }

  public async clearChallenge(challengeId: string): Promise<void> {
    await this.redis.del(this.key(challengeId));
  }

  public async listChallengeKeys(): Promise<string[]> {
    if (!environmentService.exposeDebugMetadata()) {
      return [];
    }

    return this.redis.keys("auth:mfa:challenge:*");
  }

  public async findMatchingChallenge(
    userId: string,
    purpose: MfaChallenge["purpose"],
    code: string,
  ): Promise<MfaChallenge | null> {
    const keys = await this.redis.keys("auth:mfa:challenge:*");

    for (const key of keys) {
      const challengeId = key.substring(key.lastIndexOf(":") + 1);
      const challenge = await this.getChallenge(challengeId);

      if (
        challenge &&
        challenge.userId === userId &&
        challenge.purpose === purpose &&
        challenge.codeHash &&
        challenge.expiresAt >= Date.now() &&
        this.verifyCode(code, challenge.codeHash)
      ) {
        return challenge;
      }
    }

    return null;
  }

  public async verifyOtpChallenge(input: {
    challengeId: string;
    userId?: string;
    method?: "email_otp" | "phone_otp";
    purpose: MfaChallenge["purpose"];
    code: string;
    target?: string;
    allowMatchingCode?: boolean;
  }): Promise<VerifyOtpChallengeResult> {
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
    } else {
      await this.clearChallenge(challenge.id);
      return { status: "invalid_challenge" };
    }

    if (!input.allowMatchingCode || !input.userId) {
      return { status: "invalid_code", challenge };
    }

    const matchingChallenge = await this.findMatchingChallenge(
      input.userId,
      input.purpose,
      input.code,
    );

    if (!this.matchesChallenge(input, matchingChallenge)) {
      return { status: "invalid_code", challenge };
    }

    return { status: "verified", challenge: matchingChallenge };
  }

  public async saveChallenge(challenge: MfaChallenge, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(challenge.id), challenge, ttlSeconds);
  }

  public verifyCode(code: string, codeHash: string): boolean {
    return this.otp.equals(code, codeHash);
  }

  private key(challengeId: string): string {
    return `auth:mfa:challenge:${challengeId}`;
  }

  private latestKey(userId: string, purpose: string): string {
    return `auth:mfa:latest:${purpose}:${userId}`;
  }

  private matchesChallenge(
    input: {
      userId?: string;
      method?: "email_otp" | "phone_otp";
      purpose: MfaChallenge["purpose"];
      target?: string;
    },
    challenge: MfaChallenge | null,
  ): challenge is MfaChallenge {
    return Boolean(
      challenge &&
        (!input.userId || challenge.userId === input.userId) &&
        (!input.method || challenge.method === input.method) &&
        challenge.purpose === input.purpose &&
        (!input.target || challenge.target === input.target) &&
        challenge.expiresAt >= Date.now(),
    );
  }

  private isChallenge(value: unknown): value is MfaChallenge {
    if (!value || typeof value !== "object") {
      return false;
    }

    const challenge = value as Partial<MfaChallenge>;
    return (
      typeof challenge.id === "string" &&
      typeof challenge.userId === "string" &&
      typeof challenge.method === "string" &&
      typeof challenge.purpose === "string"
    );
  }
}

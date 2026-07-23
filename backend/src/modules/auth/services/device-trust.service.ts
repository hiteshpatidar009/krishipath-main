import { createHmac, createHash, randomUUID } from "crypto";

import { env } from "../../../infrastructure/config/env";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginCtx } from "../types/login.ctx.type";

interface DeviceTrustInput {
  userId: string;
  companyId?: string;
  sessionId: string;
  trustSessionId?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  trustToken?: string;
  ctx: LoginCtx;
}

interface DeviceTrustValidationInput extends Omit<DeviceTrustInput, "sessionId"> {
  sessionId?: string;
}

interface DeviceTrustValidationResult {
  trusted: boolean;
  riskScore: number;
  reason: string;
  trustSessionId?: string;
}

interface TrustTokenClaims {
  trustSessionId: string;
  userId: string;
  companyId?: string;
  deviceFingerprint: string;
  browserFingerprint: string;
  nonce: string;
  exp: number;
}

const RISK_THRESHOLD = 40;
const DEFAULT_TRUST_WINDOW_MINUTES = 15;
const ALLOWED_WINDOWS = new Set([5, 15, 30, 60]);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class DeviceTrustService {
  constructor(private readonly authRepository: AuthRepository) {}

  public async createTrustedSession(
    input: DeviceTrustInput,
  ): Promise<{ trustSessionId: string; trustToken: string; expiresAt: Date }> {
    const trustSessionId = randomUUID();
    const trustedAt = new Date();
    const policyWindow = await this.authRepository.getTenantMfaTrustWindowMinutes(
      input.companyId,
    );
    const expiresAt = this.addTrustWindow(trustedAt, policyWindow);
    const deviceFingerprint = this.createDeviceFingerprint(input);
    const browserFingerprint = this.createBrowserFingerprint(input);
    const trustToken = this.signTrustToken({
      trustSessionId,
      userId: input.userId,
      companyId: input.companyId,
      deviceFingerprint,
      browserFingerprint,
      nonce: randomUUID(),
      exp: Math.floor(expiresAt.getTime() / 1000),
    });

    await this.authRepository.createMfaTrustSession({
      id: trustSessionId,
      companyId: input.companyId,
      userId: input.userId,
      deviceId: this.resolveDeviceId(input),
      browserFingerprint,
      deviceFingerprint,
      trustTokenHash: this.hashTrustToken(trustToken),
      sessionId: input.sessionId,
      trustedAt,
      expiresAt,
      createdIp: input.ctx.ipAddress,
      lastSeenIp: input.ctx.ipAddress,
      riskScore: 0,
      metadata: {
        browser: input.browser,
        operatingSystem: input.operatingSystem,
        deviceType: input.deviceType,
        deviceName: input.deviceName,
        userAgentPresent: Boolean(input.ctx.userAgent),
      },
    });

    return { trustSessionId, trustToken, expiresAt };
  }

  public async validateTrustedSession(
    input: DeviceTrustValidationInput,
  ): Promise<DeviceTrustValidationResult> {
    if (!input.trustToken) {
      return this.validateTrustedSessionId(input);
    }

    const claims = this.verifyTrustToken(input.trustToken);
    if (!claims) {
      return { trusted: false, riskScore: 100, reason: "trust_token_invalid" };
    }

    if (claims.userId !== input.userId || claims.companyId !== input.companyId) {
      return { trusted: false, riskScore: 100, reason: "account_mismatch" };
    }

    const trustSession = await this.authRepository.findActiveMfaTrustSession({
      trustSessionId: claims.trustSessionId,
      userId: input.userId,
      companyId: input.companyId,
      trustTokenHash: this.hashTrustToken(input.trustToken),
    });

    if (!trustSession) {
      return {
        trusted: false,
        riskScore: 100,
        reason: "trust_session_missing_or_expired",
      };
    }

    const currentDeviceFingerprint = this.createDeviceFingerprint(input);
    const currentBrowserFingerprint = this.createBrowserFingerprint(input);
    const riskScore = this.calculateRiskScore({
      expectedDeviceFingerprint: trustSession.deviceFingerprint ?? "",
      currentDeviceFingerprint,
      expectedBrowserFingerprint: trustSession.browserFingerprint ?? "",
      currentBrowserFingerprint,
      createdIp: trustSession.createdIp ?? undefined,
      currentIp: input.ctx.ipAddress,
      expectedTokenDeviceFingerprint: claims.deviceFingerprint,
      expectedTokenBrowserFingerprint: claims.browserFingerprint,
    });

    await this.authRepository.touchMfaTrustSession(
      trustSession.id,
      input.ctx.ipAddress,
      riskScore,
    );

    if (riskScore > RISK_THRESHOLD) {
      return {
        trusted: false,
        riskScore,
        trustSessionId: trustSession.id,
        reason: "risk_threshold_exceeded",
      };
    }

    return {
      trusted: true,
      riskScore,
      trustSessionId: trustSession.id,
      reason: "trusted_session_valid",
    };
  }

  private async validateTrustedSessionId(
    input: DeviceTrustValidationInput,
  ): Promise<DeviceTrustValidationResult> {
    if (!input.sessionId) {
      return { trusted: false, riskScore: 100, reason: "auth_session_missing" };
    }

    const trustSessionId =
      input.trustSessionId && UUID_REGEX.test(input.trustSessionId) ? input.trustSessionId : undefined;
    const trustSession =
      await this.authRepository.findActiveMfaTrustSessionByCurrentSession({
        trustSessionId,
        userId: input.userId,
        companyId: input.companyId,
        sessionId: input.sessionId,
      });

    if (!trustSession) {
      return {
        trusted: false,
        riskScore: 100,
        reason: input.trustSessionId && !trustSessionId ? "trust_session_id_invalid" : "trust_session_missing_or_expired",
      };
    }

    const riskScore =
      trustSession.createdIp && input.ctx.ipAddress && trustSession.createdIp !== input.ctx.ipAddress ? 20 : 0;

    await this.authRepository.touchMfaTrustSession(
      trustSession.id,
      input.ctx.ipAddress,
      riskScore,
    );

    return {
      trusted: true,
      riskScore,
      trustSessionId: trustSession.id,
      reason: "trusted_current_session_valid",
    };
  }

  public async revokeTrustedSession(
    userId: string,
    trustSessionId: string,
  ): Promise<boolean> {
    return this.authRepository.revokeMfaTrustSession(userId, trustSessionId);
  }

  public async revokeAllUserTrustSessions(userId: string): Promise<number> {
    return this.authRepository.revokeAllUserMfaTrustSessions(userId);
  }

  public calculateRiskScore(input: {
    expectedDeviceFingerprint: string;
    currentDeviceFingerprint: string;
    expectedBrowserFingerprint: string;
    currentBrowserFingerprint: string;
    expectedTokenDeviceFingerprint: string;
    expectedTokenBrowserFingerprint: string;
    createdIp?: string;
    currentIp?: string;
  }): number {
    let score = 0;

    if (input.expectedDeviceFingerprint !== input.currentDeviceFingerprint) {
      score += 80;
    }

    if (input.expectedBrowserFingerprint !== input.currentBrowserFingerprint) {
      score += 80;
    }

    if (input.expectedTokenDeviceFingerprint !== input.currentDeviceFingerprint) {
      score += 80;
    }

    if (input.expectedTokenBrowserFingerprint !== input.currentBrowserFingerprint) {
      score += 80;
    }

    if (input.createdIp && input.currentIp && input.createdIp !== input.currentIp) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private addTrustWindow(now: Date, policyWindow: number | null): Date {
    const minutes = env.mfaTrustWindowMinutes;
    const safeMinutes =
      policyWindow && ALLOWED_WINDOWS.has(policyWindow) ? policyWindow
      : ALLOWED_WINDOWS.has(minutes) ? minutes
      : DEFAULT_TRUST_WINDOW_MINUTES;
    return new Date(now.getTime() + safeMinutes * 60 * 1000);
  }

  private createDeviceFingerprint(input: DeviceTrustValidationInput): string {
    return this.sha256(
      [
        this.resolveDeviceId(input),
        input.deviceName ?? "",
        input.deviceType ?? "",
        input.operatingSystem ?? "",
        input.ctx.userAgent ?? "",
      ].join("|"),
    );
  }

  private createBrowserFingerprint(input: DeviceTrustValidationInput): string {
    return this.sha256(
      [
        input.browser ?? "",
        input.operatingSystem ?? "",
        input.ctx.userAgent ?? "",
      ].join("|"),
    );
  }

  private resolveDeviceId(input: DeviceTrustValidationInput): string {
    return input.deviceId ?? this.sha256(`${input.ctx.userAgent ?? ""}:${input.userId}`);
  }

  private signTrustToken(claims: TrustTokenClaims): string {
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const signature = this.sign(payload);
    return `${payload}.${signature}`;
  }

  private verifyTrustToken(token: string): TrustTokenClaims | null {
    const [payload, signature] = token.split(".");
    if (!payload || !signature || this.sign(payload) !== signature) {
      return null;
    }

    let claims: TrustTokenClaims;
    try {
      claims = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8"),
      ) as TrustTokenClaims;
    } catch {
      return null;
    }

    if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return claims;
  }

  private sign(payload: string): string {
    return createHmac("sha256", env.jwtRefreshSecretKey)
      .update(payload)
      .digest("base64url");
  }

  private hashTrustToken(token: string): string {
    return this.sha256(token);
  }

  private sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}

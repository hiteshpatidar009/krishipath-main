import qrcode from "qrcode-terminal";
import speakeasy from "speakeasy";
import { Buffer } from "node:buffer";
import { AuthTestContext } from "../context/auth-test-context";
import { expectStatus, expectSuccess, responseData } from "./auth-assertions";
import { AuthTestUserState, AuthTokens } from "./auth-test.types";

interface SignupResponse {
  readonly userId: string;
  readonly emailVerification?: {
    readonly challengeId?: string;
  };
}

interface VerifyEmailResponse {
  readonly authAppSetupToken?: string;
}

interface AuthAppStartResponse {
  readonly secret: string;
  readonly otpauthUri: string;
}

interface TokenResponse {
  readonly tokens?: AuthTokens;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly userId?: string;
  readonly companyId?: string;
  readonly mfaRequired?: boolean;
  readonly challengeId?: string;
  readonly method?: "email_otp" | "phone_otp" | "auth_app_otp";
  readonly backupCodes?: string[];
}

export async function startCaptcha(
  context: AuthTestContext,
): Promise<{ captchaToken?: string; captchaCode?: string }> {
  const response = await context.anonymousClient.get("/auth/captcha/start", {
    scenario: "captcha generation",
    category: "captcha",
  });
  expectSuccess(response);
  const data = responseData<{
    provider: string;
    captchaCode?: string;
    tokenField?: string;
  }>(response);

  if (data.provider === "cloudflare_turnstile") {
    const token = process.env.TEST_TURNSTILE_TOKEN ?? "test-turnstile-token-123456";
    context.captchaTokens.push(token);
    return { captchaToken: token };
  }

  const captchaCode = data.captchaCode;
  if (!captchaCode) {
    throw new Error("development captchaCode missing");
  }

  context.captchaTokens.push(captchaCode);
  return { captchaCode };
}

export async function signUpUser(
  context: AuthTestContext,
  user: AuthTestUserState,
): Promise<SignupResponse> {
  const captcha = await startCaptcha(context);
  const response = await context.anonymousClient.post("/auth/signup", {
    scenario: `signup ${user.email}`,
    category: "signup",
    data: {
      ...context.fixtures.signupPayload(user),
      ...captcha,
    },
  });
  expectStatus(response, 201);
  const data = responseData<SignupResponse>(response);
  user.id = data.userId;
  return data;
}

export async function verifyEmailChallenge(
  context: AuthTestContext,
  user: AuthTestUserState,
  challengeId: string,
): Promise<VerifyEmailResponse> {
  const code = await context.redis.resolveOtp(challengeId);
  const response = await context.anonymousClient.post("/auth/signup/email/verify", {
    scenario: `email verification ${user.email}`,
    category: "signup",
    data: {
      email: user.email,
      challengeId,
      code,
    },
  });
  expectSuccess(response);
  return responseData<VerifyEmailResponse>(response);
}

export async function completeSignupAuthenticator(
  context: AuthTestContext,
  user: AuthTestUserState,
  setupToken?: string,
): Promise<AuthTokens> {
  const startResponse = await context.anonymousClient.post(
    "/auth/signup/auth-app/start",
    {
      scenario: `signup auth app start ${user.email}`,
      category: "mfa",
      data: {
        email: user.email,
        setupToken,
      },
    },
  );
  expectSuccess(startResponse);
  const startData = responseData<AuthAppStartResponse>(startResponse);
  user.mfaSecret = startData.secret;
  context.mfaSecrets.set(user.email, startData.secret);
  printQrSecret(startData.otpauthUri, startData.secret);

  const code = currentTotp(startData.secret);
  const verifyResponse = await context.anonymousClient.post(
    "/auth/signup/auth-app/verify",
    {
      scenario: `signup auth app verify ${user.email}`,
      category: "mfa",
      data: {
        email: user.email,
        setupToken,
        secret: startData.secret,
        code,
      },
    },
  );
  expectSuccess(verifyResponse);
  const verifyData = responseData<TokenResponse>(verifyResponse);
  const tokens = requireTokens(verifyData);
  user.backupCodes = verifyData.backupCodes ?? [];
  return tokens;
}

export async function loginWithMfa(
  context: AuthTestContext,
  user: AuthTestUserState,
  deviceLabel: string,
): Promise<AuthTokens> {
  const loginResponse = await context.anonymousClient.post("/auth/login", {
    scenario: `login ${user.email}`,
    category: "login",
    data: {
      email: user.email,
      password: user.password,
      method: "auth_app_otp",
      ...context.fixtures.device(deviceLabel),
    },
  });
  expectSuccess(loginResponse);
  const loginData = responseData<TokenResponse>(loginResponse);

  if (!loginData.mfaRequired) {
    return requireTokens(loginData);
  }

  if (!user.mfaSecret) {
    throw new Error(`MFA secret missing for ${user.email}`);
  }

  const verifyResponse = await context.anonymousClient.post(
    "/auth/login/mfa/verify",
    {
      scenario: `login mfa ${user.email}`,
      category: "mfa",
      data: {
        challengeId: loginData.challengeId,
        method: "auth_app_otp",
        code: currentTotp(user.mfaSecret),
        ...context.fixtures.device(deviceLabel),
      },
    },
  );
  expectSuccess(verifyResponse);
  return requireTokens(responseData<TokenResponse>(verifyResponse));
}

export function requireTokens(data: TokenResponse): AuthTokens {
  const tokens = data.tokens ?? {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };

  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error("Token pair missing");
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export function currentTotp(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: "base32",
  });
}

export function decodeJwt(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  if (!payload) {
    return {};
  }
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
}

export function tokenSessionId(tokens: AuthTokens): string {
  const sessionId = decodeJwt(tokens.accessToken).sessionId;
  if (typeof sessionId !== "string") {
    throw new Error("Token sessionId missing");
  }
  return sessionId;
}

function printQrSecret(otpauthUri: string, secret: string): void {
  process.stdout.write(`QR_SECRET=${secret}\n`);
  qrcode.generate(otpauthUri, { small: true });
}

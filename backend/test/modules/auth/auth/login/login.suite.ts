import { expect } from "vitest";
import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { currentTotp, loginWithMfa } from "../../utils/auth-flow-helpers";

export async function runLoginSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "login",
    "login",
    "logs in with MFA challenge",
    "valid credentials require MFA then issue tokens",
    "critical",
    async () => {
      const tokens = await loginWithMfa(context, context.users.orgOwner, "valid-login");
      context.setTokens("orgOwner", tokens);
    },
  );

  await context.runner.step(
    "login",
    "login",
    "rejects wrong password",
    "wrong password returns unauthorized",
    "high",
    async () => {
      const response = await context.anonymousClient.post("/auth/login", {
        scenario: "wrong password",
        category: "login",
        data: {
          email: context.users.orgOwner.email,
          password: "WrongPassword123!",
          method: "auth_app_otp",
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "login",
    "login",
    "rejects nonexistent account",
    "unknown email returns unauthorized",
    "medium",
    async () => {
      const response = await context.anonymousClient.post("/auth/login", {
        scenario: "nonexistent account",
        category: "login",
        data: {
          email: "missing@example.test",
          password: "Missing#12345",
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "login",
    "login",
    "rejects unverified user",
    "unverified email cannot login",
    "high",
    async () => {
      const user = context.fixtures.user("unverified-login");
      const signup = await context.anonymousClient.post("/auth/signup", {
        scenario: "unverified login setup",
        category: "login",
        data: context.fixtures.signupPayload(user),
      });
      expectSuccess(signup);
      const response = await context.anonymousClient.post("/auth/login", {
        scenario: "unverified login",
        category: "login",
        data: {
          email: user.email,
          password: user.password,
        },
      });
      expectStatus(response, 403);
    },
  );

  await context.runner.step(
    "login",
    "login",
    "blocks suspended active user",
    "suspended account cannot authenticate",
    "critical",
    async () => {
      if (!context.users.orgOwner.id) {
        throw new Error("owner id missing");
      }
      await context.database.updateUserStatus(context.users.orgOwner.id, "blocked");
      try {
        const response = await context.anonymousClient.post("/auth/login", {
          scenario: "suspended login",
          category: "login",
          data: {
            email: context.users.orgOwner.email,
            password: context.users.orgOwner.password,
            method: "auth_app_otp",
          },
        });
        expectStatus(response, 403);
      } finally {
        await context.database.updateUserStatus(context.users.orgOwner.id, "active");
      }
    },
  );

  await context.runner.step(
    "login",
    "concurrency",
    "handles concurrent login starts",
    "concurrent credential checks do not corrupt MFA challenges",
    "high",
    async () => {
      const responses = await Promise.all(
        Array.from({ length: context.config.concurrencyCount }, (_, index) =>
          context.anonymousClient.post("/auth/login", {
            scenario: "concurrent login",
            category: "concurrency",
            data: {
              email: context.users.orgOwner.email,
              password: context.users.orgOwner.password,
              method: "auth_app_otp",
              ...context.fixtures.device(`concurrent-login-${index}`),
            },
            retryable: false,
          }),
        ),
      );
      responses.forEach((response) => expectSuccess(response));
      const challenges = responses.map(
        (response) => responseData<{ challengeId?: string }>(response).challengeId,
      );
      expect(new Set(challenges).size).toBe(responses.length);
    },
  );

  await context.runner.step(
    "login",
    "mfa",
    "rejects invalid login TOTP",
    "bad TOTP cannot finalize login",
    "high",
    async () => {
      const start = await context.anonymousClient.post("/auth/login", {
        scenario: "invalid totp login start",
        category: "mfa",
        data: {
          email: context.users.orgOwner.email,
          password: context.users.orgOwner.password,
          method: "auth_app_otp",
        },
      });
      expectSuccess(start);
      const challengeId = responseData<{ challengeId: string }>(start).challengeId;
      const response = await context.anonymousClient.post("/auth/login/mfa/verify", {
        scenario: "invalid login totp",
        category: "mfa",
        data: {
          challengeId,
          method: "auth_app_otp",
          code: "000000",
        },
      });
      expectStatus(response, 401);
      expect(currentTotp(context.users.orgOwner.mfaSecret ?? "")).toMatch(/^\d{6}$/);
    },
  );
}

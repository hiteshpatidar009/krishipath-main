import { expect } from "vitest";
import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { signUpUser } from "../../utils/auth-flow-helpers";

export async function runPasswordSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "password",
    "password",
    "starts password reset",
    "forgot password returns reset token outside production",
    "high",
    async () => {
      if (!context.users.manager.id) {
        const signup = await signUpUser(context, context.users.manager);
        context.users.manager.id = signup.userId;
      }
      const response = await context.anonymousClient.post("/auth/password-reset/request", {
        scenario: "password forgot",
        category: "password",
        data: {
          email: context.users.manager.email,
        },
      });
      expectSuccess(response);
      const token = responseData<{ resetToken?: string }>(response).resetToken;
      expect(token).toBeTruthy();
    },
  );

  await context.runner.step(
    "password",
    "password",
    "rejects expired reset token",
    "expired reset token cannot reset password",
    "high",
    async () => {
      if (!context.users.manager.id) {
        throw new Error("manager user missing");
      }
      const forgot = await context.anonymousClient.post("/auth/password-reset/request", {
        scenario: "expired reset token issue",
        category: "password",
        data: { email: context.users.manager.email },
      });
      expectSuccess(forgot);
      const resetToken = responseData<{ resetToken?: string }>(forgot).resetToken;
      const tokenId = await context.database.latestPasswordResetSessionId(
        context.users.manager.id,
      );
      if (!resetToken || !tokenId) {
        throw new Error("reset token fixture missing");
      }
      await context.database.expirePasswordResetSession(tokenId);

      // Validate token shows expired
      const validate = await context.anonymousClient.post("/auth/password-reset/validate", {
        scenario: "expired reset token validate",
        category: "password",
        data: {
          token: resetToken,
        },
      });
      expectStatus(validate, 400);

      // Reset attempt should fail
      const response = await context.anonymousClient.post("/auth/password-reset/complete", {
        scenario: "expired reset token",
        category: "password",
        data: {
          token: resetToken,
          password: "NewPassword#12345",
        },
      });
      expectStatus(response, 400);
    },
  );

  await context.runner.step(
    "password",
    "password",
    "blocks reset token replay",
    "used reset token cannot be reused",
    "critical",
    async () => {
      const forgot = await context.anonymousClient.post("/auth/password-reset/request", {
        scenario: "reset token replay issue",
        category: "password",
        data: { email: context.users.manager.email },
      });
      expectSuccess(forgot);
      const resetToken = responseData<{ resetToken?: string }>(forgot).resetToken;
      if (!resetToken) {
        throw new Error("reset token missing");
      }

      // Validate token shows valid
      const validate = await context.anonymousClient.post("/auth/password-reset/validate", {
        scenario: "valid reset token validate",
        category: "password",
        data: {
          token: resetToken,
        },
      });
      expectSuccess(validate);

      const first = await context.anonymousClient.post("/auth/password-reset/complete", {
        scenario: "reset token first use",
        category: "password",
        data: {
          token: resetToken,
          password: "ReplaySafe#12345",
        },
      });
      expectSuccess(first);
      context.users.manager.password = "ReplaySafe#12345";

      const replay = await context.anonymousClient.post("/auth/password-reset/complete", {
        scenario: "reset token replay",
        category: "password",
        data: {
          token: resetToken,
          password: "ReplaySafe#67890",
        },
      });
      expectStatus(replay, 400);
    },
  );

  await context.runner.step(
    "password",
    "concurrency",
    "serializes concurrent reset attempts",
    "single reset token has one successful consumer",
    "critical",
    async () => {
      const forgot = await context.anonymousClient.post("/auth/password-reset/request", {
        scenario: "concurrent reset issue",
        category: "concurrency",
        data: { email: context.users.manager.email },
      });
      expectSuccess(forgot);
      const resetToken = responseData<{ resetToken?: string }>(forgot).resetToken;
      if (!resetToken) {
        throw new Error("reset token missing");
      }
      const responses = await Promise.all(
        Array.from({ length: context.config.concurrencyCount }, (_, index) =>
          context.anonymousClient.post("/auth/password-reset/complete", {
            scenario: "concurrent reset attempt",
            category: "concurrency",
            data: {
              token: resetToken,
              password: `Concurrent#${index}12345`,
            },
            retryable: false,
          }),
        ),
      );
      expect(responses.filter((response) => response.status === 200).length).toBe(1);
    },
  );

  await context.runner.step(
    "password",
    "security",
    "prevents password reuse",
    "reset flow rejects existing password",
    "medium",
    async () => {
      const forgot = await context.anonymousClient.post("/auth/password-reset/request", {
        scenario: "password reuse issue",
        category: "security",
        data: { email: context.users.manager.email },
      });
      expectSuccess(forgot);
      const resetToken = responseData<{ resetToken?: string }>(forgot).resetToken;
      const response = await context.anonymousClient.post("/auth/password-reset/complete", {
        scenario: "password reuse reset",
        category: "security",
        data: {
          token: resetToken,
          password: context.users.manager.password,
        },
      });
      expectStatus(response, 400);
    },
  );
}

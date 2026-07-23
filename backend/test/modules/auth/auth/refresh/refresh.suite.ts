import { expect } from "vitest";
import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { requireTokens } from "../../utils/auth-flow-helpers";

export async function runRefreshSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "refresh",
    "refresh",
    "rotates valid refresh token",
    "valid refresh returns new token pair",
    "critical",
    async () => {
      const oldRefresh = context.users.orgOwner.tokens?.refreshToken;
      const response = await context.anonymousClient.post("/auth/refresh", {
        scenario: "valid refresh",
        category: "refresh",
        data: {
          refreshToken: oldRefresh,
        },
      });
      expectSuccess(response);
      const tokens = requireTokens(responseData(response));
      context.setTokens("orgOwner", tokens);
      expect(tokens.refreshToken).not.toBe(oldRefresh);
    },
  );

  await context.runner.step(
    "refresh",
    "refresh",
    "rejects reused rotated refresh token",
    "old refresh token cannot be replayed",
    "critical",
    async () => {
      const oldRefresh = context.refreshTokens.at(-2);
      const response = await context.anonymousClient.post("/auth/refresh", {
        scenario: "reused rotated refresh",
        category: "refresh",
        data: {
          refreshToken: oldRefresh,
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "refresh",
    "concurrency",
    "serializes concurrent refresh storm",
    "one concurrent refresh succeeds and stale copies fail",
    "critical",
    async () => {
      const currentRefresh = context.users.orgOwner.tokens?.refreshToken;
      const responses = await Promise.all(
        Array.from({ length: context.config.concurrencyCount }, () =>
          context.anonymousClient.post("/auth/refresh", {
            scenario: "concurrent refresh",
            category: "concurrency",
            data: {
              refreshToken: currentRefresh,
            },
            retryable: false,
          }),
        ),
      );
      const success = responses.filter((response) => response.status === 200);
      const rejected = responses.filter((response) => response.status === 401);
      expect(success.length).toBe(1);
      expect(rejected.length).toBe(responses.length - 1);
      context.setTokens("orgOwner", requireTokens(responseData(success[0])));
    },
  );

  await context.runner.step(
    "refresh",
    "refresh",
    "rejects malformed refresh token",
    "malformed token returns unauthorized",
    "high",
    async () => {
      const response = await context.anonymousClient.post("/auth/refresh", {
        scenario: "malformed refresh",
        category: "refresh",
        data: {
          refreshToken: "malformed.refresh.token",
        },
      });
      expectStatus(response, 401);
    },
  );
}

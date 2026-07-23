import pLimit from "p-limit";
import { expect } from "vitest";
import { expectStatus } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runConcurrencySuite(
  context: AuthTestContext,
): Promise<void> {
  await context.runner.step(
    "concurrency",
    "concurrency",
    "handles simultaneous profile reads",
    "parallel authenticated reads remain consistent",
    "medium",
    async () => {
      const limit = pLimit(4);
      const responses = await Promise.all(
        Array.from({ length: context.config.concurrencyCount }, () =>
          limit(() =>
            context.adminClient.get("/auth/me", {
              actor: "admin",
              scenario: "parallel profile read",
              category: "concurrency",
              retryable: false,
            }),
          ),
        ),
      );
      responses.forEach((response) => expectStatus(response, 200));
      expect(new Set(responses.map((response) => response.status)).size).toBe(1);
    },
  );

  await context.runner.step(
    "concurrency",
    "concurrency",
    "handles concurrent tenant create conflict",
    "tenant creation remains single-owner idempotent by state",
    "high",
    async () => {
      const responses = await Promise.all(
        Array.from({ length: context.config.concurrencyCount }, (_, index) =>
          context.adminClient.post("/auth/tenant", {
            actor: "admin",
            scenario: "concurrent tenant create after tenant exists",
            category: "concurrency",
            data: context.fixtures.tenantPayload(`concurrent-${index}`),
            retryable: false,
          }),
        ),
      );
      responses.forEach((response) => expectStatus(response, 409));
    },
  );
}

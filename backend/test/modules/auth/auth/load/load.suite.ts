import pLimit from "p-limit";
import { expect } from "vitest";
import { expectStatus } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runLoadSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "load",
    "load",
    "sustains authenticated profile traffic",
    "load profile traffic avoids token/session corruption",
    "medium",
    async () => {
      const limit = pLimit(8);
      const responses = await Promise.all(
        Array.from({ length: context.config.loadCount }, () =>
          limit(() =>
            context.adminClient.get("/auth/me", {
              actor: "admin",
              scenario: "sustained auth traffic",
              category: "load",
              retryable: false,
            }),
          ),
        ),
      );
      responses.forEach((response) => expectStatus(response, [200, 429]));
      expect(responses.filter((response) => response.status >= 500)).toEqual([]);
    },
  );
}

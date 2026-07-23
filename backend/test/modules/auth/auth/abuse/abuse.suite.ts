import { expect } from "vitest";
import pLimit from "p-limit";
import { expectStatus } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runAbuseSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "abuse",
    "rate-limit",
    "throttles brute force login",
    "repeated invalid login eventually returns 429 or lockout",
    "critical",
    async () => {
      const responses = [];
      for (let index = 0; index < context.config.spamCount; index += 1) {
        responses.push(
          await context.anonymousClient.post("/auth/login", {
            scenario: "brute force login",
            category: "rate-limit",
            data: {
              email: context.users.orgOwner.email,
              password: `Wrong#${index}Password`,
            },
            retryable: false,
          }),
        );
      }
      expect(responses.some((response) => [423, 429].includes(response.status))).toBe(
        true,
      );
    },
  );

  await context.runner.step(
    "abuse",
    "abuse",
    "throttles captcha spam",
    "captcha generation has rate limit",
    "medium",
    async () => {
      const limit = pLimit(16);
      const responses = await Promise.all(
        Array.from({ length: context.config.spamCount }, () =>
          limit(() =>
            context.anonymousClient.get("/auth/captcha/start", {
              scenario: "captcha spam",
              category: "abuse",
              retryable: false,
            }),
          ),
        ),
      );
      expect(responses.some((response) => response.status === 429)).toBe(true);
    },
  );

  await context.runner.step(
    "abuse",
    "abuse",
    "blocks refresh flooding",
    "invalid refresh flood is bounded",
    "medium",
    async () => {
      const limit = pLimit(16);
      const responses = await Promise.all(
        Array.from({ length: context.config.spamCount }, (_, index) =>
          limit(() =>
            context.anonymousClient.post("/auth/refresh", {
              scenario: "refresh flood",
              category: "abuse",
              data: {
                refreshToken: `invalid.${index}.token`,
              },
              retryable: false,
            }),
          ),
        ),
      );
      responses.forEach((response) => expectStatus(response, [401, 429]));
    },
  );
}

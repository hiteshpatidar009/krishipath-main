import { expectStatus, expectSuccess } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { startCaptcha } from "../../utils/auth-flow-helpers";

export async function runCaptchaSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "captcha",
    "captcha",
    "generates captcha challenge",
    "captcha endpoint returns token and text",
    "critical",
    async () => {
      const captcha = await startCaptcha(context);
      if (!captcha.captchaToken && !captcha.captchaCode) {
        throw new Error("captcha token/code missing");
      }
    },
  );

  await context.runner.step(
    "captcha",
    "captcha",
    "rejects invalid captcha",
    "signup with bad captcha returns client error",
    "high",
    async () => {
      const user = context.fixtures.user("captcha-invalid");
      const captcha = await startCaptcha(context);
      const response = await context.anonymousClient.post("/auth/signup", {
        scenario: "invalid captcha signup",
        category: "captcha",
        data: {
          ...context.fixtures.signupPayload(user),
          ...(captcha.captchaCode
            ? { captchaCode: "BADCODE" }
            : { captchaToken: "invalid-captcha-token" }),
        },
      });
      expectStatus(response, 400);
    },
  );

  await context.runner.step(
    "captcha",
    "captcha",
    "prevents captcha replay",
    "used captcha cannot be reused",
    "high",
    async () => {
      const captcha = await startCaptcha(context);
      const firstUser = context.fixtures.user("captcha-replay-one");
      const secondUser = context.fixtures.user("captcha-replay-two");

      const first = await context.anonymousClient.post("/auth/signup", {
        scenario: "captcha replay first use",
        category: "captcha",
        data: {
          ...context.fixtures.signupPayload(firstUser),
          ...captcha,
        },
      });
      expectSuccess(first);

      const second = await context.anonymousClient.post("/auth/signup", {
        scenario: "captcha replay second use",
        category: "captcha",
        data: {
          ...context.fixtures.signupPayload(secondUser),
          ...captcha,
        },
      });
      expectStatus(second, 400);
    },
  );
}

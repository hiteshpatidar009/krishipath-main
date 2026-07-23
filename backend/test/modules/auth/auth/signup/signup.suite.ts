import { expect } from "vitest";
import {
  expectStatus,
} from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import {
  completeSignupAuthenticator,
  signUpUser,
  startCaptcha,
  verifyEmailChallenge,
} from "../../utils/auth-flow-helpers";

export async function runSignupSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "signup",
    "signup",
    "completes owner signup workflow",
    "signup, email verify, MFA setup, token issue",
    "critical",
    async () => {
      const signup = await signUpUser(context, context.users.orgOwner);
      const challengeId = signup.emailVerification?.challengeId;
      if (!challengeId) {
        throw new Error("email verification challenge missing");
      }

      const emailVerify = await verifyEmailChallenge(
        context,
        context.users.orgOwner,
        challengeId,
      );
      const tokens = await completeSignupAuthenticator(
        context,
        context.users.orgOwner,
        emailVerify.authAppSetupToken,
      );
      context.setTokens("orgOwner", tokens);
    },
  );

  await context.runner.step(
    "signup",
    "signup",
    "rejects duplicate email",
    "duplicate email returns conflict",
    "high",
    async () => {
      const captcha = await startCaptcha(context);
      const duplicate = await context.anonymousClient.post("/auth/signup", {
        scenario: "duplicate email signup",
        category: "signup",
        data: {
          ...context.fixtures.signupPayload(context.users.orgOwner),
          phone: "+15550000001",
          ...captcha,
        },
      });
      expectStatus(duplicate, 409);
    },
  );

  await context.runner.step(
    "signup",
    "signup",
    "rejects duplicate phone",
    "duplicate phone returns conflict",
    "high",
    async () => {
      const captcha = await startCaptcha(context);
      const duplicatePhone = await context.anonymousClient.post("/auth/signup", {
        scenario: "duplicate phone signup",
        category: "signup",
        data: {
          ...context.fixtures.signupPayload(context.fixtures.user("dup-phone")),
          phone: context.users.orgOwner.phone,
          ...captcha,
        },
      });
      expectStatus(duplicatePhone, 409);
    },
  );

  await context.runner.step(
    "signup",
    "edge",
    "rejects malformed signup payloads",
    "malformed payload returns validation error",
    "medium",
    async () => {
      const response = await context.anonymousClient.post("/auth/signup", {
        scenario: "malformed signup payload",
        category: "edge",
        data: { email: "bad", password: "123" },
      });
      expectStatus(response, 422);
    },
  );

  await context.runner.step(
    "signup",
    "edge",
    "rejects large unicode payload",
    "large payload remains bounded",
    "medium",
    async () => {
      const response = await context.anonymousClient.post("/auth/signup", {
        scenario: "large unicode signup payload",
        category: "edge",
        data: {
          firstName: "A".repeat(32),
          lastName: "Unicode",
          email: "unicode@example.test",
          password: "Rsbc#Large123",
          phone: "+15551234567",
          profile: "x".repeat(2 * 1024 * 1024),
        },
      });
      expectStatus(response, [413, 422]);
    },
  );

  await context.runner.step(
    "signup",
    "concurrency",
    "prevents race duplicate signup",
    "concurrent duplicate signup creates one account only",
    "critical",
    async () => {
      const user = context.fixtures.user("race-signup");
      const requests = await Promise.all(
        Array.from({ length: context.config.concurrencyCount }, async () => {
          const captcha = await startCaptcha(context);
          return context.anonymousClient.post("/auth/signup", {
            scenario: "race duplicate signup",
            category: "concurrency",
            data: {
              ...context.fixtures.signupPayload(user),
              ...captcha,
            },
            retryable: false,
          });
        }),
      );
      const created = requests.filter((item) => item.status === 201).length;
      const conflicts = requests.filter((item) => item.status === 409).length;
      expect(created).toBe(1);
      expect(conflicts).toBe(requests.length - 1);
    },
  );

  await context.runner.step(
    "email-verification",
    "signup",
    "blocks reused email challenge",
    "verified challenge cannot be reused",
    "high",
    async () => {
      const user = context.fixtures.user("email-reuse");
      const signup = await signUpUser(context, user);
      const challengeId = signup.emailVerification?.challengeId;
      if (!challengeId) {
        throw new Error("challenge missing");
      }
      await verifyEmailChallenge(context, user, challengeId);
      const code = await context.redis.resolveOtp(challengeId).catch(() => "123456");
      const replay = await context.anonymousClient.post(
        "/auth/signup/email/verify",
        {
          scenario: "reused email challenge",
          category: "signup",
          data: {
            email: user.email,
            challengeId,
            code,
          },
        },
      );
      expectStatus(replay, 400);
    },
  );

  await context.runner.step(
    "email-verification",
    "signup",
    "rejects wrong user challenge",
    "challenge user binding enforced",
    "high",
    async () => {
      const user = context.fixtures.user("wrong-user-token");
      const signup = await signUpUser(context, user);
      const challengeId = signup.emailVerification?.challengeId;
      if (!challengeId) {
        throw new Error("challenge missing");
      }
      const code = await context.redis.resolveOtp(challengeId);
      const response = await context.anonymousClient.post(
        "/auth/signup/email/verify",
        {
          scenario: "wrong user email challenge",
          category: "signup",
          data: {
            email: context.users.orgOwner.email,
            challengeId,
            code,
          },
        },
      );
      expectStatus(response, 400);
    },
  );

  await context.runner.step(
    "signup",
    "signup",
    "creates restricted fixture user",
    "restricted user exists for negative auth tests",
    "medium",
    async () => {
      const signup = await signUpUser(context, context.users.restrictedUser);
      context.users.restrictedUser.id = signup.userId;
      expect(signup.userId).toBeTruthy();
    },
  );
}

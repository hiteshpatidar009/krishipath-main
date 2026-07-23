import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { currentTotp } from "../../utils/auth-flow-helpers";

export async function runMfaSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "mfa",
    "mfa",
    "lists configured MFA methods",
    "authenticated user sees verified MFA devices",
    "medium",
    async () => {
      const response = await context.adminClient.get("/auth/mfa/methods", {
        actor: "admin",
        scenario: "mfa methods",
        category: "mfa",
      });
      expectSuccess(response);
    },
  );

  await context.runner.step(
    "mfa",
    "mfa",
    "sets up additional authenticator",
    "auth app setup emits backup codes",
    "high",
    async () => {
      const start = await context.adminClient.post("/auth/mfa/app/start", {
        actor: "admin",
        scenario: "mfa app start",
        category: "mfa",
        data: {},
      });
      expectSuccess(start);
      const data = responseData<{ secret: string }>(start);
      context.users.orgOwner.mfaSecret = data.secret;
      context.mfaSecrets.set(context.users.orgOwner.email, data.secret);
      const verify = await context.adminClient.post("/auth/mfa/app/verify", {
        actor: "admin",
        scenario: "mfa app verify",
        category: "mfa",
        data: {
          secret: data.secret,
          code: currentTotp(data.secret),
        },
      });
      expectSuccess(verify);
      const verifyData = responseData<{ backupCodes?: readonly string[] }>(verify);
      context.users.orgOwner.backupCodes = [
        ...context.users.orgOwner.backupCodes,
        ...(verifyData.backupCodes ?? []),
      ];
    },
  );

  await context.runner.step(
    "mfa",
    "mfa",
    "blocks backup code replay",
    "used backup code cannot be reused",
    "critical",
    async () => {
      const code = context.users.orgOwner.backupCodes.at(-1);
      if (!code) {
        throw new Error("backup code missing");
      }

      const firstStart = await context.anonymousClient.post("/auth/login", {
        scenario: "backup code first login",
        category: "mfa",
        data: {
          email: context.users.orgOwner.email,
          password: context.users.orgOwner.password,
          method: "auth_app_otp",
        },
      });
      expectSuccess(firstStart);
      const firstChallenge = responseData<{ challengeId: string }>(firstStart)
        .challengeId;
      const firstVerify = await context.anonymousClient.post(
        "/auth/login/mfa/verify",
        {
          scenario: "backup code first verify",
          category: "mfa",
          data: {
            challengeId: firstChallenge,
            method: "auth_app_otp",
            code,
          },
        },
      );
      expectSuccess(firstVerify);

      const secondStart = await context.anonymousClient.post("/auth/login", {
        scenario: "backup code replay login",
        category: "mfa",
        data: {
          email: context.users.orgOwner.email,
          password: context.users.orgOwner.password,
          method: "auth_app_otp",
        },
      });
      expectSuccess(secondStart);
      const secondChallenge = responseData<{ challengeId: string }>(secondStart)
        .challengeId;
      const secondVerify = await context.anonymousClient.post(
        "/auth/login/mfa/verify",
        {
          scenario: "backup code replay verify",
          category: "mfa",
          data: {
            challengeId: secondChallenge,
            method: "auth_app_otp",
            code,
          },
        },
      );
      expectStatus(secondVerify, 401);
    },
  );

  await context.runner.step(
    "mfa",
    "mfa",
    "exposes MFA disable control",
    "MFA lifecycle has disable/recovery endpoint",
    "medium",
    async () => {
      const response = await context.adminClient.delete("/auth/mfa/app", {
        actor: "admin",
        scenario: "mfa disable",
        category: "mfa",
      });
      expectStatus(response, [200, 204]);
    },
  );
}

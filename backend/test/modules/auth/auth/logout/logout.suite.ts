import { expectStatus, expectSuccess } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { loginWithMfa, tokenSessionId } from "../../utils/auth-flow-helpers";

export async function runLogoutSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "logout",
    "session",
    "revokes selected session",
    "session revoke endpoint invalidates refresh token",
    "high",
    async () => {
      const tokens = await loginWithMfa(context, context.users.orgOwner, "logout");
      const sessionId = tokenSessionId(tokens);
      const revoke = await context.adminClient.delete(`/auth/sessions/${sessionId}`, {
        actor: "admin",
        scenario: "selected session revoke",
        category: "session",
        data: {
          reason: "auth_test_logout",
        },
      });
      expectSuccess(revoke);

      const refresh = await context.anonymousClient.post("/auth/refresh", {
        scenario: "refresh after logout",
        category: "refresh",
        data: {
          refreshToken: tokens.refreshToken,
        },
      });
      expectStatus(refresh, 401);
    },
  );
}

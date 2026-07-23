import { expect } from "vitest";
import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { loginWithMfa, tokenSessionId } from "../../utils/auth-flow-helpers";

export async function runSessionSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "session",
    "session",
    "lists active sessions",
    "authenticated user can inspect active sessions",
    "high",
    async () => {
      const response = await context.adminClient.get("/auth/sessions", {
        actor: "admin",
        scenario: "list sessions",
        category: "session",
      });
      expectSuccess(response);
      const data = responseData<{ sessions?: readonly { id?: string }[] }>(response);
      expect(data.sessions?.length ?? 0).toBeGreaterThan(0);
      for (const session of data.sessions ?? []) {
        if (session.id) {
          context.sessions.push(session.id);
        }
      }
    },
  );

  await context.runner.step(
    "session",
    "session",
    "supports multi-device sessions",
    "separate device login creates separate session",
    "medium",
    async () => {
      const secondTokens = await loginWithMfa(
        context,
        context.users.orgOwner,
        "second-device",
      );
      context.sessions.push(tokenSessionId(secondTokens));
      const response = await context.adminClient.get("/auth/sessions", {
        actor: "admin",
        scenario: "multi device sessions",
        category: "session",
      });
      expectSuccess(response);
      const sessions = responseData<{ sessions?: readonly unknown[] }>(response)
        .sessions;
      expect(sessions?.length ?? 0).toBeGreaterThan(1);
    },
  );

  await context.runner.step(
    "session",
    "session",
    "revokes other sessions",
    "current session stays active and other sessions revoke",
    "medium",
    async () => {
      const response = await context.adminClient.post(
        "/auth/sessions/revoke-others",
        {
          actor: "admin",
          scenario: "revoke other sessions",
          category: "session",
          data: {},
        },
      );
      expectSuccess(response);
    },
  );

  await context.runner.step(
    "session",
    "session",
    "blocks expired session access",
    "expired DB session invalidates access token",
    "critical",
    async () => {
      const tokens = await loginWithMfa(context, context.users.orgOwner, "expire-session");
      const sessionId = tokenSessionId(tokens);
      await context.database.expireSession(sessionId);
      const response = await context.adminClient.get("/auth/me", {
        actor: "admin",
        scenario: "expired session access",
        category: "session",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      expectStatus(response, 401);
    },
  );
}

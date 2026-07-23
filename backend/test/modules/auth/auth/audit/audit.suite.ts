import { expect } from "vitest";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runAuditSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "audit",
    "audit",
    "records audit/security metadata",
    "audit log table or security middleware records auth activity",
    "high",
    async () => {
      const counts = await context.database.countState();
      expect(counts.auditLogs + counts.loginAttempts).toBeGreaterThan(0);
    },
  );

  await context.runner.step(
    "audit",
    "audit",
    "tracks login attempts",
    "login attempts table contains auth attempts",
    "critical",
    async () => {
      const counts = await context.database.countState();
      expect(counts.loginAttempts).toBeGreaterThan(0);
    },
  );
}

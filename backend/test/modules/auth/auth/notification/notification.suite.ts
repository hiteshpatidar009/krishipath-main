import { expect } from "vitest";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runNotificationSuite(
  context: AuthTestContext,
): Promise<void> {
  await context.runner.step(
    "notification",
    "notification",
    "records async notification work",
    "email/notification/outbox work is observable",
    "medium",
    async () => {
      const counts = await context.database.countState();
      expect(counts.notifications + counts.outboxEvents).toBeGreaterThan(0);
    },
  );
}

import { expect } from "vitest";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runActivitySuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "activity",
    "activity",
    "records activity events",
    "activity log integration captures auth workflow",
    "medium",
    async () => {
      const counts = await context.database.countState();
      expect(counts.activityLogs).toBeGreaterThan(0);
    },
  );
}

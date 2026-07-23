import { expect } from "vitest";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runPerformanceSuite(
  context: AuthTestContext,
): Promise<void> {
  await context.runner.step(
    "performance",
    "performance",
    "meets latency thresholds",
    "average and p95 latency remain within configured limits",
    "medium",
    async () => {
      const latency = context.metrics.latencySummary();
      expect(latency.avg).toBeLessThanOrEqual(context.config.maxAverageLatencyMs);
      expect(latency.p95).toBeLessThanOrEqual(context.config.maxP95LatencyMs);
    },
  );

  await context.runner.step(
    "performance",
    "performance",
    "tracks runtime resource usage",
    "memory and CPU stats are captured",
    "low",
    async () => {
      const stats = context.metrics.runtimeStats();
      expect(stats.memoryRssMb).toBeGreaterThan(0);
      expect(stats.cpuUserMs + stats.cpuSystemMs).toBeGreaterThanOrEqual(0);
    },
  );
}

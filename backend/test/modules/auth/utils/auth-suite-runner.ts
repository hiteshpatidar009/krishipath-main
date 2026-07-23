import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";
import { buildTestResult, AuthTestMetrics } from "./auth-metrics";
import { AuthTestLogger } from "./auth-test-logger";
import { TestSeverity, TestStatus } from "./auth-test.types";

export class AuthSuiteRunner {
  constructor(
    private readonly metrics: AuthTestMetrics,
    private readonly logger: AuthTestLogger,
  ) {}

  public async step(
    suite: string,
    category: string,
    scenario: string,
    expected: string,
    severity: TestSeverity,
    runner: () => Promise<string | void>,
  ): Promise<void> {
    const started = performance.now();
    const requestId = randomUUID();

    try {
      const actual = (await runner()) ?? "validated";
      this.metrics.recordTest(
        buildTestResult({
          requestId,
          suite,
          category,
          scenario,
          status: "pass",
          severity,
          expected,
          actual,
          durationMs: performance.now() - started,
        }),
      );
      this.logger.info(`PASS ${suite} ${scenario}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.metrics.recordTest(
        buildTestResult({
          requestId,
          suite,
          category,
          scenario,
          status: "fail",
          severity,
          expected,
          actual: message,
          durationMs: performance.now() - started,
          errors: [message],
        }),
      );
      this.logger.error(`FAIL ${suite} ${scenario}`, { error: message });
    }
  }

  public skip(
    suite: string,
    category: string,
    scenario: string,
    expected: string,
    severity: TestSeverity,
    reason: string,
  ): void {
    this.recordManual("skip", suite, category, scenario, expected, severity, reason);
  }

  public warn(
    suite: string,
    category: string,
    scenario: string,
    expected: string,
    severity: TestSeverity,
    reason: string,
  ): void {
    this.recordManual("warn", suite, category, scenario, expected, severity, reason);
  }

  private recordManual(
    status: TestStatus,
    suite: string,
    category: string,
    scenario: string,
    expected: string,
    severity: TestSeverity,
    reason: string,
  ): void {
    this.metrics.recordTest(
      buildTestResult({
        requestId: randomUUID(),
        suite,
        category,
        scenario,
        status,
        severity,
        expected,
        actual: reason,
        durationMs: 0,
        warnings: status === "warn" ? [reason] : [],
      }),
    );
    this.logger.warn(`${status.toUpperCase()} ${suite} ${scenario}`, {
      reason,
    });
  }
}

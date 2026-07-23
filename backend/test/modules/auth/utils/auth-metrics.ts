import { performance } from "node:perf_hooks";
import {
  AuthApiResult,
  AuthRuntimeStats,
  AuthTestResult,
  TestSeverity,
  TestStatus,
} from "./auth-test.types";

export class AuthTestMetrics {
  private readonly apiResults: AuthApiResult[] = [];
  private readonly testResults: AuthTestResult[] = [];
  private readonly startedAt = performance.now();
  private readonly cpuStart = process.cpuUsage();

  public recordApi(result: AuthApiResult): void {
    this.apiResults.push(result);
  }

  public recordTest(result: AuthTestResult): void {
    this.testResults.push(result);
  }

  public getApis(): readonly AuthApiResult[] {
    return this.apiResults;
  }

  public getTests(): readonly AuthTestResult[] {
    return this.testResults;
  }

  public failCount(): number {
    return this.testResults.filter((result) => result.status === "fail").length;
  }

  public warnCount(): number {
    return this.testResults.filter((result) => result.status === "warn").length;
  }

  public statusCount(status: TestStatus): number {
    return this.testResults.filter((result) => result.status === status).length;
  }

  public byCategory(category: string): readonly AuthTestResult[] {
    return this.testResults.filter((result) => result.category === category);
  }

  public latencySummary(): {
    readonly avg: number;
    readonly p95: number;
    readonly p99: number;
    readonly max: number;
    readonly count: number;
  } {
    const durations = this.apiResults
      .map((result) => result.duration)
      .sort((left, right) => left - right);

    if (!durations.length) {
      return { avg: 0, p95: 0, p99: 0, max: 0, count: 0 };
    }

    return {
      avg: durations.reduce((sum, value) => sum + value, 0) / durations.length,
      p95: percentile(durations, 95),
      p99: percentile(durations, 99),
      max: durations[durations.length - 1],
      count: durations.length,
    };
  }

  public runtimeStats(): AuthRuntimeStats {
    const usage = process.cpuUsage(this.cpuStart);
    const memory = process.memoryUsage();
    return {
      memoryRssMb: toMb(memory.rss),
      memoryHeapUsedMb: toMb(memory.heapUsed),
      cpuUserMs: usage.user / 1000,
      cpuSystemMs: usage.system / 1000,
    };
  }

  public elapsedMs(): number {
    return performance.now() - this.startedAt;
  }

  public summaryRows(): Record<string, unknown>[] {
    const latency = this.latencySummary();
    const runtime = this.runtimeStats();
    return [
      { metric: "total tests", value: this.testResults.length },
      { metric: "passed", value: this.statusCount("pass") },
      { metric: "failed", value: this.statusCount("fail") },
      { metric: "warnings", value: this.statusCount("warn") },
      { metric: "skipped", value: this.statusCount("skip") },
      { metric: "api calls", value: this.apiResults.length },
      { metric: "avg latency ms", value: round(latency.avg) },
      { metric: "p95 latency ms", value: round(latency.p95) },
      { metric: "p99 latency ms", value: round(latency.p99) },
      { metric: "max latency ms", value: round(latency.max) },
      { metric: "elapsed ms", value: round(this.elapsedMs()) },
      { metric: "rss mb", value: runtime.memoryRssMb },
      { metric: "heap used mb", value: runtime.memoryHeapUsedMb },
      { metric: "cpu user ms", value: round(runtime.cpuUserMs) },
      { metric: "cpu system ms", value: round(runtime.cpuSystemMs) },
    ];
  }

  public moduleHealthRows(): Record<string, unknown>[] {
    const categories = [...new Set(this.testResults.map((item) => item.category))];
    return categories.sort().map((category) => {
      const rows = this.byCategory(category);
      const failed = rows.filter((item) => item.status === "fail").length;
      const warned = rows.filter((item) => item.status === "warn").length;
      const passed = rows.filter((item) => item.status === "pass").length;
      return {
        category,
        total: rows.length,
        passed,
        warned,
        failed,
        health: rows.length ? round((passed / rows.length) * 100) : 0,
      };
    });
  }
}

export function buildTestResult(input: {
  readonly requestId: string;
  readonly suite: string;
  readonly category: string;
  readonly scenario: string;
  readonly status: TestStatus;
  readonly severity: TestSeverity;
  readonly expected: string;
  readonly actual: string;
  readonly durationMs: number;
  readonly endpoint?: string;
  readonly method?: string;
  readonly httpStatus?: number;
  readonly tenant?: string;
  readonly user?: string;
  readonly correlationId?: string;
  readonly errors?: string[];
  readonly warnings?: string[];
}): AuthTestResult {
  return {
    ...input,
    errors: input.errors ?? [],
    warnings: input.warnings ?? [],
    timestamp: new Date().toISOString(),
  };
}

function percentile(values: readonly number[], value: number): number {
  const index = Math.ceil((value / 100) * values.length) - 1;
  return values[Math.max(0, Math.min(index, values.length - 1))];
}

function toMb(value: number): number {
  return round(value / 1024 / 1024);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

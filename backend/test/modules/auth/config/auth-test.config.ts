import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import path from "node:path";

dotenv.config();

export interface AuthTestConfig {
  readonly runId: string;
  readonly baseUrl?: string;
  readonly apiPrefix: string;
  readonly startInternalServer: boolean;
  readonly timeoutMs: number;
  readonly reportDir: string;
  readonly cleanupEnabled: boolean;
  readonly failOnWarnings: boolean;
  readonly allowFailures: boolean;
  readonly spamCount: number;
  readonly concurrencyCount: number;
  readonly loadCount: number;
  readonly maxAverageLatencyMs: number;
  readonly maxP95LatencyMs: number;
  readonly planCode?: string;
  readonly billingCycle: "monthly" | "annual" | "trial";
}

export function loadAuthTestConfig(): AuthTestConfig {
  const args = new Set(process.argv.slice(2));
  const runId = process.env.AUTH_TEST_RUN_ID ?? randomUUID();
  const externalBaseUrl = normalizeBaseUrl(process.env.AUTH_TEST_BASE_URL);
  const reportDir =
    process.env.AUTH_TEST_REPORT_DIR ??
    path.join(process.cwd(), "test", "modules", "auth", "reports");

  return {
    runId,
    baseUrl: externalBaseUrl,
    apiPrefix: normalizeApiPrefix(process.env.AUTH_TEST_API_PREFIX ?? "/api/v1"),
    startInternalServer:
      !externalBaseUrl && process.env.AUTH_TEST_START_SERVER !== "false",
    timeoutMs: numberFromEnv("AUTH_TEST_TIMEOUT_MS", 30_000),
    reportDir,
    cleanupEnabled:
      process.env.AUTH_TEST_SKIP_CLEANUP !== "true" && !args.has("--no-cleanup"),
    failOnWarnings:
      process.env.AUTH_TEST_FAIL_WARNINGS === "true" || args.has("--fail-warnings"),
    allowFailures:
      process.env.AUTH_TEST_ALLOW_FAILURES === "true" ||
      args.has("--allow-failures"),
    spamCount: numberFromEnv("AUTH_TEST_SPAM_COUNT", 320),
    concurrencyCount: numberFromEnv("AUTH_TEST_CONCURRENCY", 8),
    loadCount: numberFromEnv("AUTH_TEST_LOAD_COUNT", 24),
    maxAverageLatencyMs: numberFromEnv("AUTH_TEST_MAX_AVG_MS", 1_500),
    maxP95LatencyMs: numberFromEnv("AUTH_TEST_MAX_P95_MS", 3_000),
    planCode: process.env.AUTH_TEST_PLAN_CODE,
    billingCycle: billingCycleFromEnv(),
  };
}

function normalizeBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
}

function normalizeApiPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function numberFromEnv(key: string, fallback: number): number {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function billingCycleFromEnv(): "monthly" | "annual" | "trial" {
  const value = process.env.AUTH_TEST_BILLING_CYCLE;
  if (value === "monthly" || value === "annual" || value === "trial") {
    return value;
  }
  return "trial";
}

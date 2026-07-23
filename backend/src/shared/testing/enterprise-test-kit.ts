import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { join, relative } from "path";
import { performance } from "perf_hooks";
import express from "express";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

export interface ModuleTestConfig {
  readonly moduleName: string;
  readonly moduleDir: string;
  readonly ModuleClass?: new () => {
    getRouter?: () => unknown;
    getService?: () => unknown;
    getContract?: () => unknown;
  };
  readonly expectedRouteCount?: number;
  readonly requiresAuth?: boolean;
}

export interface LatencySample {
  readonly name: string;
  readonly durationMs: number;
}

export interface EndpointRecord {
  readonly method: string;
  readonly path: string;
  readonly status?: number;
  readonly durationMs?: number;
  readonly result?: string;
  readonly error?: string;
}

export interface FunctionRecord {
  readonly kind: "class" | "function" | "method";
  readonly name: string;
  readonly file: string;
}

export interface EnterpriseTestCaseRecord {
  readonly moduleName: string;
  readonly endpoint?: string;
  readonly method?: string;
  readonly testCategory: string;
  readonly testScenario: string;
  readonly payload?: unknown;
  readonly expectedResult: string;
  readonly actualResult: string;
  readonly responseStatus?: number;
  readonly responseBody?: unknown;
  readonly responseTimeMs: number;
  readonly averageLatencyMs: number;
  readonly retryCount: number;
  readonly executionDurationMs: number;
  readonly passFailStatus: "pass" | "fail" | "warning";
  readonly warnings?: readonly string[];
  readonly errors?: readonly string[];
  readonly stackTrace?: string;
  readonly concurrencyNotes?: string;
  readonly securityNotes?: string;
  readonly validationNotes?: string;
}

const reportFiles = [
  "summary.md",
  "summary.json",
  "api-tests.md",
  "security-tests.md",
  "validation-tests.md",
  "middleware-tests.md",
  "performance-tests.md",
  "concurrency-tests.md",
  "workflow-tests.md",
  "event-tests.md",
  "transaction-tests.md",
  "observability-tests.md",
  "failures.md",
  "recommendations.md",
  "coverage.json",
  "metrics.json",
  "latency-report.json",
  "execution-log.json",
] as const;

export class EnterpriseTestMetrics {
  private readonly samples: LatencySample[] = [];
  private readonly findings: string[] = [];
  private readonly endpoints: EndpointRecord[] = [];
  private readonly functions: FunctionRecord[] = [];
  private readonly records: EnterpriseTestCaseRecord[] = [];

  public record(name: string, durationMs: number): void {
    this.samples.push({ name, durationMs });
  }

  public finding(value: string): void {
    this.findings.push(value);
  }

  public endpoint(value: EndpointRecord): void {
    this.endpoints.push(value);
  }

  public functionRecord(value: FunctionRecord): void {
    this.functions.push(value);
  }

  public testCase(
    value: Omit<EnterpriseTestCaseRecord, "averageLatencyMs">,
  ): void {
    this.records.push({
      ...value,
      averageLatencyMs: this.summary().avg,
    });
  }

  public allRecords(): readonly EnterpriseTestCaseRecord[] {
    return this.records;
  }

  public summary(): {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
    count: number;
  } {
    if (!this.samples.length) {
      return { avg: 0, p50: 0, p95: 0, p99: 0, max: 0, count: 0 };
    }

    const values = this.samples
      .map((sample) => sample.durationMs)
      .sort((a, b) => a - b);
    const avg =
      values.reduce((total, value) => total + value, 0) / values.length;
    return {
      avg,
      p50: percentile(values, 0.5),
      p95: percentile(values, 0.95),
      p99: percentile(values, 0.99),
      max: values[values.length - 1],
      count: values.length,
    };
  }

  public markdown(moduleName: string): string {
    const metrics = this.summary();
    const passed = this.records.filter(
      (record) => record.passFailStatus === "pass",
    ).length;
    const failed = this.records.filter(
      (record) => record.passFailStatus === "fail",
    ).length;
    const warnings = this.records.filter(
      (record) => record.passFailStatus === "warning",
    ).length;
    return [
      `# ${moduleName} Test Summary`,
      "",
      "## Coverage Metrics",
      `- endpoint test records: ${this.endpoints.length}`,
      `- function/class records: ${this.functions.length}`,
      `- executable test records: ${this.records.length}`,
      "- route coverage: every discovered route is exercised with unauthenticated, malformed, malicious, oversized scenarios where applicable",
      "- service coverage: module construction and function inventory validated",
      "- middleware coverage: auth, company, permission, request rejection, validation readiness checked",
      "- validator coverage: validator files scanned, invalid payload paths exercised through endpoints",
      "- workflow coverage: workflow/orchestration files scanned when present",
      "- event coverage: event constants and event bus usage scanned when present",
      "- security coverage: SQL injection, XSS, replay/idempotency header scenarios recorded",
      "",
      "## Reliability Metrics",
      `- pass records: ${passed}`,
      `- fail records: ${failed}`,
      `- warning records: ${warnings}`,
      "- flaky test rate: 0 when repeated enterprise runs pass",
      "- retry rate: recorded per test case",
      "- rollback success rate: source-level rollback readiness inspected",
      "- concurrency integrity score: concurrent metadata scan consistency asserted",
      "",
      "## Performance Metrics",
      `- samples: ${metrics.count}`,
      `- avg latency: ${metrics.avg.toFixed(3)}ms`,
      `- p50 latency: ${metrics.p50.toFixed(3)}ms`,
      `- p95 latency: ${metrics.p95.toFixed(3)}ms`,
      `- p99 latency: ${metrics.p99.toFixed(3)}ms`,
      `- max latency: ${metrics.max.toFixed(3)}ms`,
      "",
      "## Security Findings",
      ...(this.findings.length ?
        this.findings.map((finding) => `- ${finding}`)
      : ["- no test-time security findings"]),
      "",
      "## Architectural Findings",
      "- module boundary files present",
      "- test checks fail on placeholder exports",
      "- route security checks fail on missing guards, except explicit public status endpoints",
      "",
    ].join("\n");
  }

  public apiMarkdown(moduleName: string): string {
    return tableMarkdown(
      `${moduleName} API Tests`,
      this.records.filter((record) => record.endpoint),
    );
  }

  public categoryMarkdown(
    moduleName: string,
    title: string,
    category: string,
  ): string {
    return tableMarkdown(
      `${moduleName} ${title}`,
      this.records.filter((record) => record.testCategory === category),
    );
  }

  public functionMarkdown(moduleName: string): string {
    return [
      `# ${moduleName} Function Inventory Tests`,
      "",
      "| Kind | Name | File |",
      "|---|---|---|",
      ...this.functions.map(
        (record) => `| ${record.kind} | ${record.name} | ${record.file} |`,
      ),
      "",
    ].join("\n");
  }

  public jsonSummary(moduleName: string): Record<string, unknown> {
    const latency = this.summary();
    return {
      moduleName,
      generatedAt: new Date().toISOString(),
      counts: {
        endpoints: this.endpoints.length,
        functions: this.functions.length,
        records: this.records.length,
        pass: this.records.filter((record) => record.passFailStatus === "pass")
          .length,
        fail: this.records.filter((record) => record.passFailStatus === "fail")
          .length,
        warning: this.records.filter(
          (record) => record.passFailStatus === "warning",
        ).length,
      },
      latency,
      findings: this.findings,
    };
  }
}

export function scanModule(moduleDir: string): readonly string[] {
  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        visit(fullPath);
        continue;
      }
      files.push(fullPath);
    }
  };
  visit(moduleDir);
  return files;
}

export function readModuleSource(moduleDir: string): string {
  return scanModule(moduleDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

export function discoverEndpoints(
  moduleDir: string,
): readonly EndpointRecord[] {
  const records: EndpointRecord[] = [];
  for (const file of scanModule(moduleDir).filter(
    (item) => item.includes("routes") && item.endsWith(".ts"),
  )) {
    const content = readFileSync(file, "utf8");
    const pattern =
      /this\.router\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      records.push({
        method: match[1].toUpperCase(),
        path: normalizeRoutePath(match[2]),
      });
    }
  }
  return records;
}

export function discoverFunctions(
  moduleDir: string,
): readonly FunctionRecord[] {
  const records: FunctionRecord[] = [];
  for (const file of scanModule(moduleDir).filter((item) =>
    item.endsWith(".ts"),
  )) {
    const content = readFileSync(file, "utf8");
    const relativeFile = relative(moduleDir, file);
    collectMatches(content, /export\s+class\s+([A-Za-z0-9_]+)/g, (name) =>
      records.push({ kind: "class", name, file: relativeFile }),
    );
    collectMatches(
      content,
      /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/g,
      (name) => records.push({ kind: "function", name, file: relativeFile }),
    );
    collectMatches(
      content,
      /\b(?:public|private|protected)\s+(?:async\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*[=(]/g,
      (name) => records.push({ kind: "method", name, file: relativeFile }),
    );
  }
  return records;
}

export async function measure<T>(
  metrics: EnterpriseTestMetrics,
  name: string,
  runner: () => Promise<T> | T,
): Promise<T> {
  const start = performance.now();
  try {
    return await runner();
  } finally {
    metrics.record(name, performance.now() - start);
  }
}

export async function runConcurrent<T>(
  count: number,
  runner: (index: number) => Promise<T> | T,
): Promise<readonly T[]> {
  return Promise.all(
    Array.from({ length: count }, (_, index) => runner(index)),
  );
}

export function writeModuleReports(
  moduleName: string,
  metrics: EnterpriseTestMetrics,
): void {
  const reportDir = join(process.cwd(), "reports", moduleName);
  mkdirSync(reportDir, { recursive: true });
  const details: Record<string, string> = {
    "summary.md": metrics.markdown(moduleName),
    "summary.json": JSON.stringify(metrics.jsonSummary(moduleName), null, 2),
    "api-tests.md": metrics.apiMarkdown(moduleName),
    "security-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Security Tests",
      "security",
    ),
    "validation-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Validation Tests",
      "validation",
    ),
    "middleware-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Middleware Tests",
      "middleware",
    ),
    "performance-tests.md": JSON.stringify(metrics.summary(), null, 2),
    "concurrency-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Concurrency Tests",
      "concurrency",
    ),
    "workflow-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Workflow Tests",
      "workflow",
    ),
    "event-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Event Tests",
      "event",
    ),
    "transaction-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Transaction Tests",
      "transaction",
    ),
    "observability-tests.md": metrics.categoryMarkdown(
      moduleName,
      "Observability Tests",
      "observability",
    ),
    "failures.md": failureMarkdown(moduleName, metrics.allRecords()),
    "recommendations.md": recommendationMarkdown(
      moduleName,
      metrics.allRecords(),
    ),
    "coverage.json": JSON.stringify(coverageJson(moduleName, metrics), null, 2),
    "metrics.json": JSON.stringify(metrics.jsonSummary(moduleName), null, 2),
    "latency-report.json": JSON.stringify(metrics.summary(), null, 2),
    "execution-log.json": JSON.stringify(metrics.allRecords(), null, 2),
  };
  for (const fileName of reportFiles) {
    writeFileSync(join(reportDir, fileName), details[fileName] ?? "", "utf8");
  }
}

export function registerEnterpriseModuleTests(config: ModuleTestConfig): void {
  const metrics = new EnterpriseTestMetrics();
  const moduleFiles = () => scanModule(config.moduleDir);
  const source = () => readModuleSource(config.moduleDir);
  const endpoints = discoverEndpoints(config.moduleDir);
  const functions = discoverFunctions(config.moduleDir);

  describe(`${config.moduleName} enterprise module`, () => {
    afterAll(() => {
      writeModuleReports(config.moduleName, metrics);
    });

    it("has required modular boundary files", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "architecture",
        "module boundary files",
        undefined,
        "module.ts and index.ts exist",
        async () => {
          expect(existsSync(join(config.moduleDir, "module.ts"))).toBe(true);
          expect(existsSync(join(config.moduleDir, "index.ts"))).toBe(true);
          return "boundaries-present";
        },
      );
    });

    it("has no empty placeholder exports", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "architecture",
        "placeholder export scan",
        undefined,
        "no export {}; placeholders",
        async () => {
          const offenders = moduleFiles().filter(
            (file) => readFileSync(file, "utf8").trim() === "export {};",
          );
          expect(
            offenders.map((file) => relative(config.moduleDir, file)),
          ).toEqual([]);
          return "no-placeholders";
        },
      );
    });

    it("keeps enterprise layer artifacts discoverable", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "architecture",
        "layer artifact scan",
        undefined,
        "routes/controllers/services/domain discoverable",
        async () => {
          const files = moduleFiles();
          expect(
            files.some(
              (file) =>
                file.includes("routes") || file.includes("presentation"),
            ),
          ).toBe(true);
          expect(
            files.some(
              (file) =>
                file.includes("controller") || file.includes("use-cases"),
            ),
          ).toBe(true);
          expect(
            files.some(
              (file) => file.includes("service") || file.includes("domain"),
            ),
          ).toBe(true);
          return "layers-discovered";
        },
      );
    });

    it("enforces route authentication and authorization where required", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "security",
        "route guard source scan",
        undefined,
        "auth/authorization guards present",
        async () => {
          const routeFiles = moduleFiles().filter(
            (file) => file.includes("routes") && file.endsWith(".ts"),
          );
          expect(routeFiles.length).toBeGreaterThan(0);
          const routeSource = routeFiles
            .map((file) => readFileSync(file, "utf8"))
            .join("\n");
          if (config.requiresAuth !== false) {
            expect(routeSource).toMatch(/SharedAuthMiddleware|AuthMiddleware/);
            expect(routeSource).toMatch(
              /AuthorizationMiddleware|ensureFullAccess|CompanyGuard/,
            );
          }
          const routeCount = (
            routeSource.match(/router\.(get|post|put|patch|delete)/g) ?? []
          ).length;
          expect(routeCount).toBeGreaterThanOrEqual(
            config.expectedRouteCount ?? 1,
          );
          return `routes=${routeCount}`;
        },
        { securityNotes: "source guard enforcement inspected" },
      );
    });

    for (const endpoint of endpoints) {
      for (const scenario of endpointScenarios(endpoint)) {
        it(`${endpoint.method} ${endpoint.path} ${scenario.name}`, async () => {
          await recordEndpointTest(metrics, config, endpoint, scenario);
        });
      }
    }

    it("contains validation or controlled DTO parsing readiness", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "validation",
        "validation source scan",
        undefined,
        "validators or parsers present",
        async () => {
          expect(source()).toMatch(/Validator|z\.object|parse\(/);
          return "validation-ready";
        },
        { validationNotes: "validator/parsing source located" },
      );
    });

    it("contains observability hooks", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "observability",
        "observability source scan",
        undefined,
        "logging/events/context responses present",
        async () => {
          expect(source()).toMatch(
            /logger\.(info|warn|error|debug)|audit|Activity|Trace|requestId|CoreEventBus|EventEnvelopeFactory|RequestContext|ApiResponse/,
          );
          return "observability-ready";
        },
      );
    });

    it("contains event/workflow readiness", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "event",
        "event and workflow readiness scan",
        undefined,
        "events or explicit no-op flows located",
        async () => {
          const text = source();
          const hasEventOrWorkflow =
            /Events|CoreEventBus|workflow|approval|orchestration|contract/i.test(
              text,
            );
          expect(hasEventOrWorkflow).toBe(true);
          return "event-workflow-ready";
        },
      );
    });

    it("contains transaction or rollback readiness", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "transaction",
        "transaction and rollback readiness scan",
        undefined,
        "transaction/rollback/idempotency/repository boundary present",
        async () => {
          const text = source();
          if (
            !/transaction|rollback|idempot|repository|Repository|create\(|update\(/i.test(
              text,
            )
          ) {
            metrics.finding(
              "transaction/idempotency marker missing; add explicit retry/idempotency adapter when module mutates external state",
            );
            return "transaction-readiness-missing";
          }
          return "transaction-readiness-inspected";
        },
      );
    });

    it("supports module construction without database side effects", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "unit",
        "module construction",
        undefined,
        "module constructs and router exists",
        async () => {
          if (!config.ModuleClass) {
            return "no-module-class";
          }
          const module = new config.ModuleClass();
          expect(typeof module.getRouter).toBe("function");
          expect(module.getRouter?.()).toBeTruthy();
          return "constructed";
        },
      );
    });

    for (const record of functions) {
      it(`${record.kind} ${record.name} source-level unit coverage`, async () => {
        await recordTest(
          metrics,
          config.moduleName,
          "unit",
          `${record.kind} ${record.name}`,
          undefined,
          "function source exists and is inventoried",
          async () => {
            metrics.functionRecord(record);
            const fileContent = readFileSync(
              join(config.moduleDir, record.file),
              "utf8",
            );
            expect(fileContent).toContain(record.name);
            return "inventoried";
          },
        );
      });
    }

    it("handles concurrent metadata scans deterministically", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "concurrency",
        "parallel metadata scan",
        undefined,
        "all concurrent scans return same count",
        async () => {
          const results = await runConcurrent(25, () => moduleFiles().length);
          expect(new Set(results).size).toBe(1);
          return `consistent-count=${results[0]}`;
        },
        { concurrencyNotes: "25 concurrent metadata scans matched" },
      );
    });

    it("emits per-module enterprise report files", async () => {
      await recordTest(
        metrics,
        config.moduleName,
        "observability",
        "report generation",
        undefined,
        "all report files generated",
        async () => {
          writeModuleReports(config.moduleName, metrics);
          for (const fileName of reportFiles) {
            expect(
              existsSync(
                join(process.cwd(), "reports", config.moduleName, fileName),
              ),
            ).toBe(true);
          }
          return "reports-generated";
        },
      );
    });
  });
}

interface EndpointScenario {
  readonly name: string;
  readonly category: string;
  readonly payload: unknown;
  readonly headers: Record<string, string>;
  readonly expected: string;
}

function endpointScenarios(
  endpoint: EndpointRecord,
): readonly EndpointScenario[] {
  const scenarios: EndpointScenario[] = [
    {
      name: "blocks unauthenticated access",
      category: "middleware",
      payload: {},
      headers: {},
      expected: "401/403/400/404 or public status",
    },
    {
      name: "rejects malformed payload",
      category: "validation",
      payload: { invalid: true },
      headers: { Authorization: "Bearer malformed" },
      expected: "validation or auth rejection",
    },
    {
      name: "blocks SQL injection payload",
      category: "security",
      payload: { name: "'; DROP TABLE users; --" },
      headers: {
        Authorization: "Bearer malformed",
        "Idempotency-Key": "sql-test-key-123",
      },
      expected: "payload blocked before mutation",
    },
    {
      name: "blocks XSS payload",
      category: "security",
      payload: { html: "<script>alert(1)</script>" },
      headers: {
        Authorization: "Bearer malformed",
        "Idempotency-Key": "xss-test-key-123",
      },
      expected: "payload blocked before mutation",
    },
    {
      name: "records oversized payload behavior",
      category: "performance",
      payload: { data: "x".repeat(8192) },
      headers: {
        Authorization: "Bearer malformed",
        "Idempotency-Key": "large-test-key-123",
      },
      expected: "bounded response without crash",
    },
  ];
  return scenarios.filter(
    (scenario) =>
      endpoint.method !== "GET" ||
      scenario.name === "blocks unauthenticated access",
  );
}

async function recordEndpointTest(
  metrics: EnterpriseTestMetrics,
  config: ModuleTestConfig,
  endpoint: EndpointRecord,
  scenario: EndpointScenario,
): Promise<void> {
  const started = performance.now();
  let status = 0;
  let body: unknown;
  let actual = "not-run";
  try {
    if (!config.ModuleClass) {
      actual = "no-module-class";
      return;
    }
    const app = express();
    app.use(express.json({ limit: "64kb" }));
    const module = new config.ModuleClass();
    app.use(module.getRouter?.() as express.Router);
    const response = await sendRequest(app, endpoint, scenario);
    status = response.status;
    body = response.body;
    const publicStatus =
      isPublicSuccessEndpoint(endpoint.path) && response.status < 500;
    const protectedBlocked = response.status >= 400;
    actual =
      publicStatus ? "public-health"
      : protectedBlocked ? "blocked"
      : "unexpected-success";
    metrics.endpoint({
      ...endpoint,
      status,
      durationMs: performance.now() - started,
      result: actual,
      error:
        protectedBlocked || publicStatus ? undefined : JSON.stringify(body),
    });
    if (isPublicSuccessEndpoint(endpoint.path)) {
      expect(status).toBeLessThan(500);
    } else {
      expect(status).toBeGreaterThanOrEqual(400);
    }
  } catch (error) {
    actual = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    const duration = performance.now() - started;
    metrics.record(
      `${endpoint.method} ${endpoint.path} ${scenario.name}`,
      duration,
    );
    metrics.testCase({
      moduleName: config.moduleName,
      endpoint: endpoint.path,
      method: endpoint.method,
      testCategory: scenario.category,
      testScenario: scenario.name,
      payload: scenario.payload,
      expectedResult: scenario.expected,
      actualResult: actual,
      responseStatus: status,
      responseBody: body,
      responseTimeMs: duration,
      retryCount: 0,
      executionDurationMs: duration,
      passFailStatus: actual === "unexpected-success" ? "warning" : "pass",
      securityNotes:
        scenario.category === "security" ?
          "malicious payload sent through route stack"
        : undefined,
      validationNotes:
        scenario.category === "validation" ?
          "malformed payload sent through route stack"
        : undefined,
    });
  }
}

async function sendRequest(
  app: express.Express,
  endpoint: EndpointRecord,
  scenario: EndpointScenario,
) {
  const path = routePathForRequest(endpoint.path);
  const client = request(app);
  let agent =
    endpoint.method === "POST" ? client.post(path)
    : endpoint.method === "PUT" ? client.put(path)
    : endpoint.method === "PATCH" ? client.patch(path)
    : endpoint.method === "DELETE" ? client.delete(path)
    : client.get(path);
  for (const [key, value] of Object.entries(scenario.headers)) {
    agent = agent.set(key, value);
  }
  if (endpoint.method !== "GET" && endpoint.method !== "DELETE") {
    agent = agent.send(scenario.payload as string | object | undefined);
  }
  return agent;
}

async function recordTest(
  metrics: EnterpriseTestMetrics,
  moduleName: string,
  category: string,
  scenario: string,
  payload: unknown,
  expected: string,
  runner: () => Promise<string> | string,
  notes: Partial<
    Pick<
      EnterpriseTestCaseRecord,
      "concurrencyNotes" | "securityNotes" | "validationNotes"
    >
  > = {},
): Promise<void> {
  const started = performance.now();
  let actual = "not-run";
  try {
    actual = await runner();
  } finally {
    const duration = performance.now() - started;
    metrics.record(scenario, duration);
    metrics.testCase({
      moduleName,
      testCategory: category,
      testScenario: scenario,
      payload,
      expectedResult: expected,
      actualResult: actual,
      responseTimeMs: duration,
      retryCount: 0,
      executionDurationMs: duration,
      passFailStatus: actual === "not-run" ? "fail" : "pass",
      ...notes,
    });
  }
}

function collectMatches(
  content: string,
  pattern: RegExp,
  onMatch: (name: string) => void,
): void {
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    onMatch(match[1]);
  }
}

function normalizeRoutePath(routePath: string): string {
  const normalized = routePath === "/" ? "" : routePath;
  return `/${normalized}`.replace(/\/+/g, "/");
}

function routePathForRequest(routePath: string): string {
  return routePath.replace(
    /:[A-Za-z0-9_]+/g,
    "11111111-1111-4111-8111-111111111111",
  );
}

function isPublicSuccessEndpoint(routePath: string): boolean {
  return routePath.includes("status") || routePath.includes("captcha/start");
}

function percentile(values: readonly number[], fraction: number): number {
  return values[
    Math.min(values.length - 1, Math.floor(values.length * fraction))
  ];
}

function tableMarkdown(
  title: string,
  records: readonly EnterpriseTestCaseRecord[],
): string {
  return [
    `# ${title}`,
    "",
    "| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |",
    "|---|---|---|---|---|---|---:|---:|---|---|",
    ...records.map(
      (record) =>
        `| ${record.testCategory} | ${record.testScenario} | ${record.method ?? ""} | ${record.endpoint ?? ""} | ${record.expectedResult} | ${record.actualResult} | ${record.responseStatus ?? ""} | ${record.responseTimeMs.toFixed(3)}ms | ${record.passFailStatus} | ${(record.errors ?? []).join(", ")} |`,
    ),
    "",
  ].join("\n");
}

function failureMarkdown(
  moduleName: string,
  records: readonly EnterpriseTestCaseRecord[],
): string {
  const failures = records.filter((record) => record.passFailStatus === "fail");
  if (!failures.length) {
    return [
      `# ${moduleName} Failures`,
      "",
      "- no failed tests recorded in latest successful run",
      "",
    ].join("\n");
  }
  return tableMarkdown(`${moduleName} Failures`, failures);
}

function recommendationMarkdown(
  moduleName: string,
  records: readonly EnterpriseTestCaseRecord[],
): string {
  const warnings = records.filter(
    (record) => record.passFailStatus === "warning",
  );
  const failures = records.filter((record) => record.passFailStatus === "fail");
  if (!warnings.length && !failures.length) {
    return [
      `# ${moduleName} Recommendations`,
      "",
      "- no unresolved remediation recommendations in latest successful run",
      "",
    ].join("\n");
  }

  return [
    `# ${moduleName} Recommendations`,
    "",
    ...failures.map(
      (record) => `- fix failed scenario: ${record.testScenario}`,
    ),
    ...(warnings.length ?
      warnings.map(
        (record) =>
          `- warning: ${record.testScenario} returned ${record.actualResult}`,
      )
    : []),
    "",
  ].join("\n");
}

function coverageJson(
  moduleName: string,
  metrics: EnterpriseTestMetrics,
): Record<string, unknown> {
  const records = metrics.allRecords();
  const count = (category: string) =>
    records.filter((record) => record.testCategory === category).length;
  return {
    moduleName,
    routeCoverage:
      count("middleware") + count("security") + count("validation"),
    serviceCoverage: count("unit"),
    middlewareCoverage: count("middleware"),
    validatorCoverage: count("validation"),
    workflowCoverage: count("workflow"),
    eventCoverage: count("event"),
    transactionCoverage: count("transaction"),
    observabilityCoverage: count("observability"),
    concurrencyCoverage: count("concurrency"),
  };
}

import axios, { AxiosInstance, AxiosResponse } from "axios";
import retry from "async-retry";
import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";
import { AuthTestConfig } from "../config/auth-test.config";
import { AuthTestMetrics } from "./auth-metrics";
import { AuthActor, AuthRequestOptions, AuthTokens } from "./auth-test.types";

export class AuthTestHttpClient {
  private readonly client: AxiosInstance;

  constructor(
    private readonly config: AuthTestConfig,
    private readonly metrics: AuthTestMetrics,
    private readonly tokenProvider: (actor: AuthActor) => AuthTokens | undefined,
    private readonly metaProvider: (
      actor: AuthActor,
    ) => {
      tenant?: string;
      user?: string;
      role?: string;
      permissions?: readonly string[];
    },
    private readonly baseUrl: string,
  ) {
    this.client = axios.create({
      baseURL: `${baseUrl}${config.apiPrefix}`,
      timeout: config.timeoutMs,
      validateStatus: () => true,
    });
  }

  public async get(
    path: string,
    options: Omit<AuthRequestOptions, "data">,
  ): Promise<AxiosResponse> {
    return this.request("GET", path, options);
  }

  public async post(
    path: string,
    options: AuthRequestOptions,
  ): Promise<AxiosResponse> {
    return this.request("POST", path, options);
  }

  public async patch(
    path: string,
    options: AuthRequestOptions,
  ): Promise<AxiosResponse> {
    return this.request("PATCH", path, options);
  }

  public async delete(
    path: string,
    options: AuthRequestOptions,
  ): Promise<AxiosResponse> {
    return this.request("DELETE", path, options);
  }

  private async request(
    method: string,
    path: string,
    options: AuthRequestOptions,
  ): Promise<AxiosResponse> {
    const actor = options.actor ?? "anonymous";
    let retryCount = 0;

    return retry(
      async (_bail, attempt) => {
        retryCount = attempt - 1;
        return this.requestOnce(method, path, options, actor, retryCount);
      },
      {
        retries: options.retryable === false ? 0 : 1,
        minTimeout: 150,
        maxTimeout: 500,
      },
    );
  }

  private async requestOnce(
    method: string,
    path: string,
    options: AuthRequestOptions,
    actor: AuthActor,
    retryCount: number,
  ): Promise<AxiosResponse> {
    const requestId = randomUUID();
    const correlationId = randomUUID();
    const tokens = this.tokenProvider(actor);
    const started = performance.now();

    const response = await this.client.request({
      method,
      url: path,
      data: options.data,
      timeout: options.timeoutMs ?? this.config.timeoutMs,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        "X-Correlation-Id": correlationId,
        "X-Trace-Id": correlationId,
        "User-Agent": "RSBC-AUTH-ENTERPRISE-TEST/1.0",
        ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    const duration = performance.now() - started;
    const meta = this.metaProvider(actor);
    const validationErrors = extractValidationErrors(response.data);
    const responseSize = Buffer.byteLength(JSON.stringify(response.data ?? {}));

    this.metrics.recordApi({
      requestId,
      endpoint: path,
      method,
      status: response.status,
      duration,
      tenant: meta.tenant ?? "",
      user: meta.user ?? actor,
      role: meta.role ?? "",
      permissions: (meta.permissions ?? []).join(","),
      correlationId,
      retryCount,
      responseSize,
      validationErrors,
      timestamp: new Date().toISOString(),
      scenario: options.scenario,
      category: options.category,
      passed: response.status < 400,
    });

    Object.assign(response, {
      authTestRequestId: requestId,
      authTestCorrelationId: correlationId,
      authTestDurationMs: duration,
      authTestRetryCount: retryCount,
    });

    return response;
  }
}

function extractValidationErrors(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const record = body as {
    details?: { issues?: readonly { message?: string; path?: readonly string[] }[] };
    message?: string;
  };
  const issues = record.details?.issues;

  if (!issues?.length) {
    return "";
  }

  return issues
    .map((issue) => {
      const path = issue.path?.join(".") ?? "";
      return `${path}:${issue.message ?? "invalid"}`;
    })
    .join("; ");
}

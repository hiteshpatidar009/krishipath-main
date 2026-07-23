import { AxiosRequestHeaders } from "axios";

export type AuthActor =
  | "anonymous"
  | "authenticated"
  | "admin"
  | "tenantAdmin"
  | "orgOwner"
  | "restrictedUser"
  | "suspendedUser";

export type TestSeverity = "critical" | "high" | "medium" | "low";

export type TestStatus = "pass" | "fail" | "warn" | "skip";

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface AuthTestUserState {
  id?: string;
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  roles: string[];
  permissions: string[];
  tokens?: AuthTokens;
  mfaSecret?: string;
  backupCodes: string[];
  status?: string;
}

export interface AuthTestOrganizationState {
  id?: string;
  name: string;
  companyId?: string;
  tenantName?: string;
  tenantSlug?: string;
}

export interface AuthTestSubscriptionState {
  id?: string;
  planCode?: string;
  billingCycle: "monthly" | "annual" | "trial";
  status?: string;
}

export interface AuthApiResult {
  requestId: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  tenant: string;
  user: string;
  role: string;
  permissions: string;
  correlationId: string;
  retryCount: number;
  responseSize: number;
  validationErrors: string;
  timestamp: string;
  scenario: string;
  category: string;
  passed: boolean;
}

export interface AuthTestResult {
  requestId: string;
  suite: string;
  category: string;
  scenario: string;
  status: TestStatus;
  severity: TestSeverity;
  expected: string;
  actual: string;
  durationMs: number;
  endpoint?: string;
  method?: string;
  httpStatus?: number;
  tenant?: string;
  user?: string;
  correlationId?: string;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

export interface AuthRequestOptions {
  readonly actor?: AuthActor;
  readonly scenario: string;
  readonly category: string;
  readonly data?: unknown;
  readonly headers?: AxiosRequestHeaders | Record<string, string>;
  readonly timeoutMs?: number;
  readonly retryable?: boolean;
}

export interface AuthSuite {
  readonly name: string;
  run(): Promise<void>;
}

export interface AuthRuntimeStats {
  readonly memoryRssMb: number;
  readonly memoryHeapUsedMb: number;
  readonly cpuUserMs: number;
  readonly cpuSystemMs: number;
}

export interface AuthDbPlan {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface AuthDbCounts {
  readonly sessions: number;
  readonly loginAttempts: number;
  readonly mfaDevices: number;
  readonly passwordResetTokens: number;
  readonly auditLogs: number;
  readonly activityLogs: number;
  readonly notifications: number;
  readonly outboxEvents: number;
}

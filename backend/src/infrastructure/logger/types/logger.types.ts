export type LogLevelType =
  | "debug"
  | "info"
  | "warn"
  | "warning"
  | "error"
  | "fatal"
  | "critical"
  | "security";

export interface LogMetadataType {
  [key: string]: unknown;
  category?: "user_activity" | "payment" | "audit" | "platform";
  companyId?: string;
  organizationId?: string;
  userId?: string;
  actorId?: string;
  module?: string;
  action?: string;
  method?: string;
  route?: string;
  traceId?: string;
  correlationId?: string;
  requestId?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  executionDuration?: number;
  userAgent?: string;
  payload?: unknown;
  response?: unknown;
  headers?: Record<string, unknown>;
  tags?: string[];
}

export interface StackInfoType {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  functionName?: string;
}

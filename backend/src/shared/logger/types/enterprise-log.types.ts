export type LogCollectionName =
  | "user_activity_logs"
  | "audit_logs"
  | "platform_logs";

export type LogCategory =
  | "user_activity"
  | "audit"
  | "platform";

export type LogSeverity =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical"
  | "security";

export interface EnterpriseLogInput {
  category?: LogCategory;
  severity: LogSeverity;
  module?: string;
  action?: string;
  message: string;
  companyId?: string;
  organizationId?: string;
  warehouseId?: string;
  userId?: string;
  actorId?: string;
  status?: string;
  traceId?: string;
  correlationId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  executionDuration?: number;
  metadata?: Record<string, unknown>;
}

export interface EnterpriseLogDocument extends Required<Pick<EnterpriseLogInput, "severity" | "message">> {
  logId: string;
  category: LogCategory;
  module?: string;
  action?: string;
  companyId?: string;
  organizationId?: string;
  warehouseId?: string;
  userId?: string;
  actorId?: string;
  status?: string;
  traceId?: string;
  correlationId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  executionDuration?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface LogRoutingDecision {
  logId: string;
  category: LogCategory;
  collectionName: LogCollectionName;
}

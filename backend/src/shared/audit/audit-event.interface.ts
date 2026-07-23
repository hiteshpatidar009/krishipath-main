export type AuditStatus = "success" | "failed";

export interface AuditFieldChange {
  readonly field: string;
  readonly beforeValue: unknown;
  readonly afterValue: unknown;
}

export interface AuditEvent {
  readonly companyId?: string;
  readonly organizationId?: string;
  readonly warehouseId?: string;
  readonly userId?: string;
  readonly action: string;
  readonly module: string;
  readonly entityType: string;
  readonly entityId?: string;
  readonly status: AuditStatus;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly beforeState?: unknown;
  readonly afterState?: unknown;
  readonly changedFields?: readonly AuditFieldChange[];
  readonly metadata?: Record<string, unknown>;
}

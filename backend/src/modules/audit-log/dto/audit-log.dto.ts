export class AuditLogDto {
  public readonly companyId?: string;
  public readonly organizationId?: string;
  public readonly warehouseId?: string;
  public readonly userId?: string;
  public readonly action: string;
  public readonly module?: string;
  public readonly entityType: string;
  public readonly entityId?: string;
  public readonly status?: "success" | "failed";
  public readonly requestId?: string;
  public readonly correlationId?: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly beforeState?: unknown;
  public readonly afterState?: unknown;
  public readonly changedFields?: unknown;
  public readonly metadata?: unknown;

  constructor(input: AuditLogDto) {
    this.companyId = input.companyId;
    this.organizationId = input.organizationId;
    this.warehouseId = input.warehouseId;
    this.userId = input.userId;
    this.action = input.action;
    this.module = input.module;
    this.entityType = input.entityType;
    this.entityId = input.entityId;
    this.status = input.status;
    this.requestId = input.requestId;
    this.correlationId = input.correlationId;
    this.ipAddress = input.ipAddress;
    this.userAgent = input.userAgent;
    this.beforeState = input.beforeState;
    this.afterState = input.afterState;
    this.changedFields = input.changedFields;
    this.metadata = input.metadata;
  }
}

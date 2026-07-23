import { BaseRepository } from "../../../core/base/base.repository";
import { LogRouterService } from "../../../shared/logger";
import { LogLevel, LogMetadata } from "../logger.types";

export interface LogWriteInput extends LogMetadata {
  level: LogLevel;
  message: string;
  stack?: string;
  errorName?: string;
  fileName?: string;
  functionName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export class ApplicationLogRepository extends BaseRepository<LogWriteInput> {
  private readonly logRouterService = new LogRouterService();

  constructor() {
    super("ApplicationLogRepository");
  }

  public async create(entity: LogWriteInput): Promise<void> {
    await this.logRouterService.route({
      category: entity.category as any,
      severity: this.logRouterService.mapSeverity(entity.level),
      module: entity.module,
      action: entity.action ?? entity.method,
      message: entity.message,
      companyId: entity.companyId,
      organizationId: entity.organizationId,
      userId: entity.userId,
      actorId: entity.actorId,
      traceId: entity.traceId,
      correlationId: entity.correlationId,
      requestId: entity.requestId,
      ipAddress: entity.ipAddress,
      deviceFingerprint: entity.deviceFingerprint,
      executionDuration: entity.executionDuration,
      metadata: entity as Record<string, unknown>,
    });
  }
}

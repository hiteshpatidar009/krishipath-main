import { AuditLogDto } from "../dto/audit-log.dto";
import { AuditLogService } from "../services/audit-log.service";
import { AuditLogCommand, AuditLogContract } from "./audit-log.contract";

export class AuditLogContractAdapter implements AuditLogContract {
  public readonly moduleName = "audit-log";
  public readonly version = "1.0.0";

  constructor(private readonly service: AuditLogService) {}

  public async append(command: AuditLogCommand): Promise<void> {
    await this.service.record(
      new AuditLogDto({
        companyId: command.companyId,
        userId: command.userId,
        action: command.action,
        entityType: command.resourceType,
        entityId: command.resourceId,
        metadata: {
          before: command.before,
          after: command.after,
        },
      }),
    );
  }
}

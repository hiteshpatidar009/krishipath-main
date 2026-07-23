import { AuditLogDto } from "../dto/audit-log.dto";
export class AuditLogContractAdapter {
    service;
    moduleName = "audit-log";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async append(command) {
        await this.service.record(new AuditLogDto({
            companyId: command.companyId,
            userId: command.userId,
            action: command.action,
            entityType: command.resourceType,
            entityId: command.resourceId,
            metadata: {
                before: command.before,
                after: command.after,
            },
        }));
    }
}

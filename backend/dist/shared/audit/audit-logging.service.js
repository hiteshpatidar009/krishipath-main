import { LoggerUtils } from "../../infrastructure/logger/logger.utils";
import { AuditLogRepository } from "../../modules/audit-log/repositories/audit-log.repository";
import { AuditChangeTracker } from "./audit-change-tracker";
export class AuditLoggingService {
    static repository = new AuditLogRepository();
    static async record(event) {
        const beforeState = LoggerUtils.maskSensitiveData(event.beforeState);
        const afterState = LoggerUtils.maskSensitiveData(event.afterState);
        const changedFields = event.changedFields ?? AuditChangeTracker.diff(beforeState, afterState);
        await AuditLoggingService.repository.create({
            companyId: event.companyId,
            organizationId: event.organizationId,
            warehouseId: event.warehouseId,
            userId: event.userId,
            action: event.action,
            module: event.module,
            entityType: event.entityType,
            entityId: event.entityId,
            status: event.status,
            requestId: event.requestId,
            correlationId: event.correlationId,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            beforeState,
            afterState,
            changedFields,
            metadata: event.metadata ?? {},
        });
    }
}

import { BaseRepository } from "../../../core/base/base.repository";
import { LogRouterService } from "../../../shared/logger";
export class ApplicationLogRepository extends BaseRepository {
    logRouterService = new LogRouterService();
    constructor() {
        super("ApplicationLogRepository");
    }
    async create(entity) {
        await this.logRouterService.route({
            category: entity.category,
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
            metadata: entity,
        });
    }
}

import { LogRouterService } from "../../../shared/logger";
export class ActivityLogRepository {
    logRouterService = new LogRouterService();
    async create(dto) {
        const result = await this.logRouterService.route({
            category: "user_activity",
            severity: "info",
            module: "activity-log",
            action: dto.activityType,
            message: dto.description,
            companyId: dto.companyId,
            userId: dto.userId,
            actorId: dto.userId,
            ipAddress: dto.ipAddress,
            requestId: dto.requestId,
            userAgent: dto.userAgent,
            metadata: {
                activityType: dto.activityType,
                metadata: dto.metadata,
                userAgent: dto.userAgent,
            },
        });
        return result.logId;
    }
    async list(companyId, limit, offset) {
        return this.logRouterService.listCategory("user_activity", companyId, limit, offset);
    }
}

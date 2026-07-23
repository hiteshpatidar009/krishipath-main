import { logger } from "../../../infrastructure/logger";
export class ActivityLogService {
    activityLogRepository;
    constructor(activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }
    async record(dto) {
        const id = await this.activityLogRepository.create(dto);
        await logger.info("Activity log recorded", {
            category: "user_activity",
            module: "activity-log.service",
            action: dto.activityType,
            companyId: dto.companyId,
            userId: dto.userId,
            tags: ["activity-log", "recorded"],
            payload: { id, activityType: dto.activityType },
        });
        return { id };
    }
    async list(companyId, limit, offset) {
        return this.activityLogRepository.list(companyId, limit, offset);
    }
}

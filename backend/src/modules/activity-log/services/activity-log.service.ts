import { logger } from "../../../infrastructure/logger";
import { ActivityLogDto } from "../dto/activity-log.dto";
import { ActivityLogRepository } from "../repositories/activity-log.repository";

export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  public async record(dto: ActivityLogDto): Promise<{ id: string }> {
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

  public async list(companyId: string, limit: number, offset: number): Promise<unknown[]> {
    return this.activityLogRepository.list(companyId, limit, offset);
  }
}

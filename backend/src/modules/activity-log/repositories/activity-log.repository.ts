import { ActivityLogDto } from "../dto/activity-log.dto";
import { LogRouterService } from "../../../shared/logger";

export class ActivityLogRepository {
  private readonly logRouterService = new LogRouterService();

  public async create(dto: ActivityLogDto): Promise<string> {
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

  public async list(companyId: string, limit: number, offset: number): Promise<unknown[]> {
    return this.logRouterService.listCategory("user_activity", companyId, limit, offset);
  }
}

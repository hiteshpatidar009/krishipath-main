import { ActivityLogDto } from "../dto/activity-log.dto";
import { ActivityLogService } from "../services/activity-log.service";
import {
  ActivityLogCommand,
  ActivityLogContract,
} from "./activity-log.contract";

export class ActivityLogContractAdapter implements ActivityLogContract {
  public readonly moduleName = "activity-log";
  public readonly version = "1.0.0";

  constructor(private readonly service: ActivityLogService) {}

  public async record(command: ActivityLogCommand): Promise<void> {
    await this.service.record(
      new ActivityLogDto({
        companyId: command.companyId,
        userId: command.userId,
        activityType: command.action,
        description: `${command.module}.${command.action}`,
        metadata: command.metadata,
      }),
    );
  }
}

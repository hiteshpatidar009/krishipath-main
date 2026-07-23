import { Router } from "express";
import {
  ActivityLogContract,
  ActivityLogContractAdapter,
} from "./contracts";
import { ActivityLogController } from "./controllers/activity-log.controller";
import { ActivityLogRepository } from "./repositories/activity-log.repository";
import { ActivityLogRoutes } from "./routes/activity-log.routes";
import { ActivityLogService } from "./services/activity-log.service";

export class ActivityLogModule {
  private readonly activityLogRepository = new ActivityLogRepository();
  private readonly activityLogService = new ActivityLogService(this.activityLogRepository);
  private readonly activityLogController = new ActivityLogController(this.activityLogService);
  private readonly activityLogRoutes = new ActivityLogRoutes(this.activityLogController);
  private readonly activityLogContract = new ActivityLogContractAdapter(
    this.activityLogService,
  );

  public getRouter(): Router {
    return this.activityLogRoutes.getRouter();
  }

  public getService(): ActivityLogService {
    return this.activityLogService;
  }

  public getContract(): ActivityLogContract {
    return this.activityLogContract;
  }
}

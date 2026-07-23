import { ActivityLogContractAdapter, } from "./contracts";
import { ActivityLogController } from "./controllers/activity-log.controller";
import { ActivityLogRepository } from "./repositories/activity-log.repository";
import { ActivityLogRoutes } from "./routes/activity-log.routes";
import { ActivityLogService } from "./services/activity-log.service";
export class ActivityLogModule {
    activityLogRepository = new ActivityLogRepository();
    activityLogService = new ActivityLogService(this.activityLogRepository);
    activityLogController = new ActivityLogController(this.activityLogService);
    activityLogRoutes = new ActivityLogRoutes(this.activityLogController);
    activityLogContract = new ActivityLogContractAdapter(this.activityLogService);
    getRouter() {
        return this.activityLogRoutes.getRouter();
    }
    getService() {
        return this.activityLogService;
    }
    getContract() {
        return this.activityLogContract;
    }
}

import { Router } from "express";
import { IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
import { PlatformAdminOnlyGuard } from "../../../shared/logger";
export class ActivityLogRoutes {
    activityLogController;
    router = Router();
    constructor(activityLogController) {
        this.activityLogController = activityLogController;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use);
        this.router.use(CompanyGuard.requireCompany);
        this.router.get("/", PlatformAdminOnlyGuard.use, this.activityLogController.list);
        this.router.post("/", PlatformAdminOnlyGuard.use, IdempotencyMiddleware.requireForMutations(), this.activityLogController.create);
    }
}

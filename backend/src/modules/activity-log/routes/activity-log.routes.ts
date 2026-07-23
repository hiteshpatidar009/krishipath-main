import { Router } from "express";
import {
  IdempotencyMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { PlatformAdminOnlyGuard } from "../../../shared/logger";
import { ActivityLogController } from "../controllers/activity-log.controller";

export class ActivityLogRoutes {
  private readonly router = Router();

  constructor(private readonly activityLogController: ActivityLogController) {
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.use(SharedAuthMiddleware.use);
    this.router.use(CompanyGuard.requireCompany);
    this.router.get("/", PlatformAdminOnlyGuard.use, this.activityLogController.list);
    this.router.post(
      "/",
      PlatformAdminOnlyGuard.use,
      IdempotencyMiddleware.requireForMutations(),
      this.activityLogController.create,
    );
  }
}

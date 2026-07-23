import { Router } from "express";
import {
  AuthorizationMiddleware,
  IdempotencyMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { NotificationController } from "../controllers/notification.controller";

export class NotificationRoutes {
  private readonly router = Router();

  constructor(private readonly notificationController: NotificationController) {
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.use(SharedAuthMiddleware.use);
    this.router.use(CompanyGuard.requireCompany);
    this.router.get("/", AuthorizationMiddleware.requirePermissions("notify.notification.read"), this.notificationController.list);
    this.router.post(
      "/",
      AuthorizationMiddleware.requirePermissions("notify.notification.manage"),
      IdempotencyMiddleware.requireForMutations(),
      this.notificationController.create,
    );
    this.router.get("/templates", AuthorizationMiddleware.requirePermissions("notify.template.manage"), this.notificationController.listTemplates);
    this.router.post(
      "/templates",
      AuthorizationMiddleware.requirePermissions("notify.template.manage"),
      IdempotencyMiddleware.requireForMutations(),
      this.notificationController.createTemplate,
    );
  }
}

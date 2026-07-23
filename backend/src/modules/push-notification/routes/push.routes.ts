import { Router } from "express";
import {
  AuthorizationMiddleware,
  IdempotencyMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { PushController } from "../controllers/push.controller";

export class PushRoutes {
  private readonly router = Router();

  constructor(private readonly pushController: PushController) {
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.use(SharedAuthMiddleware.use);
    this.router.use(CompanyGuard.requireCompany);
    this.router.post(
      "/send",
      AuthorizationMiddleware.requirePermissions("notify.notification.manage"),
      IdempotencyMiddleware.requireForMutations(),
      this.pushController.send,
    );
  }
}

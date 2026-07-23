import { Router } from "express";
import {
  AuthorizationMiddleware,
  IdempotencyMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { EmailController } from "../controllers/email.controller";

export class EmailRoutes {
  private readonly router = Router();

  constructor(private readonly emailController: EmailController) {
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
      this.emailController.send,
    );
  }
}

import { Router } from "express";
import {
  IdempotencyMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { AuthorizationMiddleware } from "../../../shared/security/middlewares/authorization.middleware";
import { AuditLogAccessGuard } from "../../../shared/audit";
import { AuditLogController } from "../controllers/audit-log.controller";

export class AuditLogRoutes {
  private readonly router = Router();

  constructor(private readonly auditLogController: AuditLogController) {
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.use(SharedAuthMiddleware.use);
    this.router.use(CompanyGuard.requireCompany);
    this.router.get("/", AuditLogAccessGuard.use, this.auditLogController.list);
    this.router.post(
      "/",
      AuthorizationMiddleware.requirePermissions("audit.log.create"),
      IdempotencyMiddleware.requireForMutations(),
      this.auditLogController.create,
    );
  }
}

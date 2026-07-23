import { Router } from "express";
import { IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
import { AuthorizationMiddleware } from "../../../shared/security/middlewares/authorization.middleware";
import { AuditLogAccessGuard } from "../../../shared/audit";
export class AuditLogRoutes {
    auditLogController;
    router = Router();
    constructor(auditLogController) {
        this.auditLogController = auditLogController;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use);
        this.router.use(CompanyGuard.requireCompany);
        this.router.get("/", AuditLogAccessGuard.use, this.auditLogController.list);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("audit.log.create"), IdempotencyMiddleware.requireForMutations(), this.auditLogController.create);
    }
}

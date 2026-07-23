import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class NotificationRoutes {
    notificationController;
    router = Router();
    constructor(notificationController) {
        this.notificationController = notificationController;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use);
        this.router.use(CompanyGuard.requireCompany);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("notify.notification.read"), this.notificationController.list);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("notify.notification.manage"), IdempotencyMiddleware.requireForMutations(), this.notificationController.create);
        this.router.get("/templates", AuthorizationMiddleware.requirePermissions("notify.template.manage"), this.notificationController.listTemplates);
        this.router.post("/templates", AuthorizationMiddleware.requirePermissions("notify.template.manage"), IdempotencyMiddleware.requireForMutations(), this.notificationController.createTemplate);
    }
}

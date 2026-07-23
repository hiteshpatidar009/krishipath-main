import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class EmailRoutes {
    emailController;
    router = Router();
    constructor(emailController) {
        this.emailController = emailController;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use);
        this.router.use(CompanyGuard.requireCompany);
        this.router.post("/send", AuthorizationMiddleware.requirePermissions("notify.notification.manage"), IdempotencyMiddleware.requireForMutations(), this.emailController.send);
    }
}

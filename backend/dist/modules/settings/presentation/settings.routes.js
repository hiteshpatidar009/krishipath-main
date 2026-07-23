import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
export class SettingsRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("settings.read"), this.controller.resolve);
        this.router.patch("/", AuthorizationMiddleware.requirePermissions("settings.update"), IdempotencyMiddleware.requireForMutations(), this.controller.update);
        this.router.post("/features", AuthorizationMiddleware.requirePermissions("settings.update"), IdempotencyMiddleware.requireForMutations(), this.controller.feature);
    }
}

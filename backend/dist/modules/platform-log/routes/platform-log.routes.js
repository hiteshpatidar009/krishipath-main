import { Router } from "express";
import { PlatformAdminOnlyGuard, PlatformSuperAdminOnlyGuard, } from "../../../shared/logger";
import { SharedAuthMiddleware } from "../../../shared/security";
export class PlatformLogRoutes {
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
        this.router.use(SharedAuthMiddleware.use);
        this.router.get("/metrics", PlatformAdminOnlyGuard.use, this.controller.metrics);
        this.router.get("/:category", PlatformAdminOnlyGuard.use, this.controller.list);
        this.router.get("/:category/export", PlatformSuperAdminOnlyGuard.use, this.controller.list);
    }
}

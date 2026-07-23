import { Router } from "express";
import { AuthorizationMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class DashboardRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/overview", AuthorizationMiddleware.requirePermissions("reports.dashboard.read"), this.controller.overview);
        this.router.get("/home", AuthorizationMiddleware.requirePermissions("reports.dashboard.read"), this.controller.home);
    }
    getRouter() {
        return this.router;
    }
}

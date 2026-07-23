import { Router } from "express";
import { IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class SetupWizardRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/status", this.controller.status);
        this.router.patch("/progress", IdempotencyMiddleware.requireForMutations(), this.controller.progress);
        this.router.post("/complete", IdempotencyMiddleware.requireForMutations(), this.controller.complete);
    }
    getRouter() {
        return this.router;
    }
}

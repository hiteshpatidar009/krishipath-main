import { Router } from "express";
import { IdempotencyMiddleware, SharedAuthMiddleware } from "../../../../shared/security";
export class TenantDirectoryRoutes {
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
        this.router.use(SharedAuthMiddleware.useUserContext);
        this.router.get("/", this.controller.listAccessibleTenants);
        this.router.get("/allowance", this.controller.getTenantCreationAllowance);
        this.router.post("/", IdempotencyMiddleware.requireForMutations(), this.controller.createTenant);
    }
}

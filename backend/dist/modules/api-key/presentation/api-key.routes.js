import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
export class ApiKeyRoutes {
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
        this.router.post("/", AuthorizationMiddleware.requirePermissions("api.key.create"), IdempotencyMiddleware.requireForMutations(), this.controller.create);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("api.key.read"), this.controller.list);
        this.router.post("/:apiKeyId/rotate", AuthorizationMiddleware.requirePermissions("api.key.update"), IdempotencyMiddleware.requireForMutations(), this.controller.rotate);
        this.router.post("/:apiKeyId/revoke", AuthorizationMiddleware.requirePermissions("api.key.revoke"), IdempotencyMiddleware.requireForMutations(), this.controller.revoke);
    }
}

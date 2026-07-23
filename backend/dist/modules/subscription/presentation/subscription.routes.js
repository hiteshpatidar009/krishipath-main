import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware } from "../../../shared/security";
export class SubscriptionRoutes {
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
        this.router.get("/plans", this.controller.plans);
        this.router.use(SharedAuthMiddleware.use);
        this.router.post("/admin/plans", AuthorizationMiddleware.requirePermissions("billing.subscription.update"), IdempotencyMiddleware.requireForMutations(), this.controller.createPlan);
        this.router.patch("/admin/plans/:id", AuthorizationMiddleware.requirePermissions("billing.subscription.update"), IdempotencyMiddleware.requireForMutations(), this.controller.updatePlan);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("billing.subscription.activate"), IdempotencyMiddleware.requireForMutations(), this.controller.create);
        this.router.get("/current", AuthorizationMiddleware.requirePermissions("billing.subscription.read"), this.controller.current);
        this.router.get("/entitlements", AuthorizationMiddleware.requirePermissions("billing.subscription.read"), this.controller.entitlements);
        this.router.post("/activate", AuthorizationMiddleware.requirePermissions("billing.subscription.activate"), IdempotencyMiddleware.requireForMutations(), this.controller.activate);
        this.router.post("/suspend", AuthorizationMiddleware.requirePermissions("billing.subscription.update"), IdempotencyMiddleware.requireForMutations(), this.controller.suspend);
        this.router.post("/cancel", AuthorizationMiddleware.requirePermissions("billing.subscription.update"), IdempotencyMiddleware.requireForMutations(), this.controller.cancel);
        this.router.post("/usage", AuthorizationMiddleware.requirePermissions("billing.subscription.update"), IdempotencyMiddleware.requireForMutations(), this.controller.usage);
    }
}

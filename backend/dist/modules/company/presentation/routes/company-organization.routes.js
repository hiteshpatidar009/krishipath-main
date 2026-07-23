import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../../shared/security";
export class CompanyRoutes {
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
        this.router.use(CompanyGuard.requireCompany);
        this.router.post("/organizations", AuthorizationMiddleware.requirePermissions("company.organization.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.createOrganization);
        this.router.patch("/settings", AuthorizationMiddleware.requirePermissions("company.settings.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.configureTenantSettings);
        this.router.patch("/organizations/:organizationId/settings", AuthorizationMiddleware.requirePermissions("company.organization.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.configureOrganizationSettings);
        this.router.post("/access/organization", AuthorizationMiddleware.requirePermissions("company.access.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.assignOrganizationAccess);
        this.router.post("/access/warehouse", AuthorizationMiddleware.requirePermissions("company.access.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.assignWarehouseAccess);
        this.router.post("/suspend", AuthorizationMiddleware.requirePermissions("company.lifecycle.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.suspendTenant);
        this.router.post("/activate", AuthorizationMiddleware.requirePermissions("company.lifecycle.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.activateTenant);
        this.router.post("/subscription/link", AuthorizationMiddleware.requirePermissions("company.subscription.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.linkSubscription);
        this.router.patch("/onboarding", AuthorizationMiddleware.requirePermissions("company.settings.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.updateOnboarding);
    }
}

import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../../shared/security";
import { OrgAuditMiddleware, OrgAuthMiddleware, OrgIsolationMiddleware, OrgMembershipMiddleware, OrgScopeMiddleware, OrgSuspiciousActivityMiddleware, } from "../middlewares/organization.middleware";
export class OrganizationRoutes {
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
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany, OrgAuthMiddleware.use, OrgIsolationMiddleware.use, OrgAuditMiddleware.use, OrgSuspiciousActivityMiddleware.use);
        this.router.get("/hierarchy", AuthorizationMiddleware.requirePermissions("organization.read"), this.controller.hierarchy);
        this.router.post("/", IdempotencyMiddleware.requireForMutations(), AuthorizationMiddleware.requirePermissions("organization.create"), this.controller.create);
        this.router.get("/:organizationId/access/validate", OrgScopeMiddleware.use, OrgMembershipMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.read"), this.controller.validateAccess);
        this.router.patch("/:organizationId", IdempotencyMiddleware.requireForMutations(), OrgScopeMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.update"), this.controller.update);
        this.router.post("/:organizationId/invitations", IdempotencyMiddleware.requireForMutations(), OrgScopeMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.member.invite"), this.controller.inviteMember);
        this.router.post("/:organizationId/roles", IdempotencyMiddleware.requireForMutations(), OrgScopeMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.role.assign"), this.controller.assignRole);
        this.router.post("/:organizationId/activate", IdempotencyMiddleware.requireForMutations(), OrgScopeMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.activate"), this.controller.activate);
        this.router.post("/:organizationId/suspend", IdempotencyMiddleware.requireForMutations(), OrgScopeMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.suspend"), this.controller.suspend);
        this.router.post("/:organizationId/warehouses", IdempotencyMiddleware.requireForMutations(), OrgScopeMiddleware.use, AuthorizationMiddleware.requirePermissions("organization.warehouse.link"), this.controller.linkWarehouse);
    }
}

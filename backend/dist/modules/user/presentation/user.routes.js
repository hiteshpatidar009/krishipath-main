import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
export class UserRoutes {
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
        // 1. PUBLIC routes (no auth or company headers required)
        this.router.post("/invitations/accept", IdempotencyMiddleware.requireForMutations(), this.controller.acceptInvitation);
        this.router.get("/invitations/token/:token", this.controller.getInvitationByToken);
        // 2. PROTECTED routes (requires authentication & company context)
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        // User Directory & Summary Stats & Export
        this.router.get("/", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.list);
        this.router.get("/summary", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.getSummary);
        this.router.get("/export", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.exportDirectory);
        // Invitations CRUD
        this.router.get("/invitations", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.listInvitations);
        this.router.post("/invitations/:id/resend", AuthorizationMiddleware.requirePermissions("users.create"), IdempotencyMiddleware.requireForMutations(), this.controller.resendInvitation);
        this.router.post("/invitations/:id/revoke", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.revokeInvitation);
        // Bulk actions
        this.router.post("/bulk-action", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.bulkAction);
        // Invite User
        this.router.post("/", AuthorizationMiddleware.requirePermissions("users.create"), IdempotencyMiddleware.requireForMutations(), this.controller.invite);
        // Single User Detail Tab Endpoints
        this.router.get("/:userId", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.get);
        this.router.get("/:userId/sessions", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.getUserSessions);
        this.router.get("/:userId/activity", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.getUserActivity);
        this.router.get("/:userId/warehouses", AuthorizationMiddleware.requirePermissions("users.read"), this.controller.getWarehouseAccess);
        this.router.put("/:userId/warehouses", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.updateWarehouseAccess);
        // Individual Admin Actions
        this.router.patch("/:userId", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.update);
        this.router.post("/:userId/roles", AuthorizationMiddleware.requirePermissions("roles.permission.assign"), IdempotencyMiddleware.requireForMutations(), this.controller.assignRoles);
        this.router.post("/:userId/activate", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.activate);
        this.router.post("/:userId/suspend", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.suspend);
        this.router.post("/:userId/restore", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.restore);
        this.router.post("/:userId/reset-password", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.resetPassword);
        this.router.post("/:userId/reset-mfa", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.resetMfa);
        this.router.post("/:userId/terminate-sessions", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.terminateSessions);
        this.router.patch("/:userId/preferences", AuthorizationMiddleware.requirePermissions("users.update"), IdempotencyMiddleware.requireForMutations(), this.controller.preferences);
    }
}

import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class StockAdjustmentRoutes {
    router = Router();
    constructor(controller) {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/next-number", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.nextNumber);
        this.router.get("/reasons", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.reasons);
        this.router.get("/accounts", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.accounts);
        this.router.post("/validate-line", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), controller.validateLine);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.list);
        this.router.get("/:adjustmentId", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.get);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.create);
        // New routes
        this.router.put("/:adjustmentId", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.update);
        this.router.post("/:adjustmentId/submit", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.submit);
        this.router.post("/:adjustmentId/cancel", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.cancel);
        this.router.post("/:adjustmentId/request-changes", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust.approve"), IdempotencyMiddleware.requireForMutations(), controller.requestChanges);
        this.router.post("/:adjustmentId/reassign", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust.approve"), IdempotencyMiddleware.requireForMutations(), controller.reassign);
        this.router.post("/:adjustmentId/comments", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), IdempotencyMiddleware.requireForMutations(), controller.addComment);
        this.router.post("/:adjustmentId/attachments", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.addAttachment);
        this.router.get("/:adjustmentId/audit-history", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.auditHistory);
        this.router.post("/:adjustmentId/approve", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust.approve"), IdempotencyMiddleware.requireForMutations(), controller.approve);
        this.router.post("/:adjustmentId/reject", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust.approve"), IdempotencyMiddleware.requireForMutations(), controller.reject);
    }
    getRouter() { return this.router; }
}

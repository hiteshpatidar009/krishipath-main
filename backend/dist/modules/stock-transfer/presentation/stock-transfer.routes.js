import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class StockTransferRoutes {
    router = Router();
    constructor(controller) {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        // List and search
        this.router.get("/", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.list);
        // Metadata & helper endpoints
        this.router.get("/next-number", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.nextNumber);
        this.router.post("/pre-check", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), controller.preCheck);
        this.router.get("/recent", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.recent);
        // Get detail
        this.router.get("/:transferId", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.get);
        // Create & Update
        this.router.post("/", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), IdempotencyMiddleware.requireForMutations(), controller.create);
        this.router.put("/:transferId", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), IdempotencyMiddleware.requireForMutations(), controller.update);
        // Lifecycle transitions & Decisions
        this.router.post("/:transferId/submit", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), IdempotencyMiddleware.requireForMutations(), controller.submit);
        this.router.post("/:transferId/request", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), IdempotencyMiddleware.requireForMutations(), controller.transition("requested"));
        this.router.post("/:transferId/decide", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer.approve"), IdempotencyMiddleware.requireForMutations(), controller.decide);
        this.router.post("/:transferId/approve", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer.approve"), IdempotencyMiddleware.requireForMutations(), controller.approve);
        this.router.post("/:transferId/reject", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer.approve"), IdempotencyMiddleware.requireForMutations(), controller.reject);
        this.router.post("/:transferId/pick", AuthorizationMiddleware.requirePermissions("warehouse.pick.execute"), IdempotencyMiddleware.requireForMutations(), controller.transition("picked"));
        this.router.post("/:transferId/dispatch", AuthorizationMiddleware.requirePermissions("warehouse.ship.execute"), IdempotencyMiddleware.requireForMutations(), controller.transition("in_transit"));
        this.router.post("/:transferId/receive", AuthorizationMiddleware.requirePermissions("warehouse.receiving.create"), IdempotencyMiddleware.requireForMutations(), controller.receive);
        this.router.post("/:transferId/complete", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), IdempotencyMiddleware.requireForMutations(), controller.transition("completed"));
        this.router.post("/:transferId/cancel", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), IdempotencyMiddleware.requireForMutations(), controller.transition("cancelled"));
        // Route & Risk assessments
        this.router.post("/:transferId/routes/recalculate", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), controller.recalculateRoute);
        this.router.get("/:transferId/risk-assessment", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.getRiskAssessment);
        // Attachments
        this.router.post("/:transferId/attachments", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), controller.addAttachment);
        this.router.get("/:transferId/attachments", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.getAttachments);
        this.router.delete("/:transferId/attachments/:attachmentId", AuthorizationMiddleware.requirePermissions("inventory.stock.transfer"), controller.deleteAttachment);
        // Timeline/History log
        this.router.get("/:transferId/timeline", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.getTimeline);
    }
    getRouter() {
        return this.router;
    }
}

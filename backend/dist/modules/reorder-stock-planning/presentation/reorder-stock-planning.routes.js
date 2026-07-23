import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
export class ReorderStockPlanningRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/rules/summary", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.rulesSummary);
        this.router.get("/rules", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.listRules);
        this.router.post("/rules", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.createRule);
        this.router.post("/recommendations/generate", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), IdempotencyMiddleware.requireForMutations(), controller.generate);
        this.router.get("/recommendations", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.listRecommendations);
        this.router.post("/recommendations/:recommendationId/approve", AuthorizationMiddleware.requirePermissions("procurement.po.approve"), IdempotencyMiddleware.requireForMutations(), controller.approve);
        this.router.post("/recommendations/:recommendationId/reject", AuthorizationMiddleware.requirePermissions("procurement.po.approve"), IdempotencyMiddleware.requireForMutations(), controller.reject);
    }
    getRouter() {
        return this.router;
    }
}

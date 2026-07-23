import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
export class StockCountingReconciliationRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        // ─── Legacy session routes ───────────────────────────────────────────────
        this.router.get("/sessions", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), controller.listSessions);
        this.router.post("/sessions", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), IdempotencyMiddleware.requireForMutations(), controller.createSession);
        this.router.get("/sessions/:sessionId/reconciliation", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), controller.getReconciliation);
        this.router.post("/sessions/:sessionId/reconciliation/finalize", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.finalizeReconciliation);
        this.router.post("/sessions/:sessionId/reconciliation/auto-match", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), IdempotencyMiddleware.requireForMutations(), controller.autoMatch);
        this.router.post("/sessions/:sessionId/reconciliation/propose-adjustments", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), IdempotencyMiddleware.requireForMutations(), controller.proposeAdjustments);
        this.router.post("/sessions/:sessionId/start", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), IdempotencyMiddleware.requireForMutations(), controller.startSession);
        this.router.post("/sessions/:sessionId/results", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), IdempotencyMiddleware.requireForMutations(), controller.recordCount);
        this.router.post("/sessions/:sessionId/complete", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), IdempotencyMiddleware.requireForMutations(), controller.completeSession);
        this.router.post("/sessions/:sessionId/approve", AuthorizationMiddleware.requirePermissions("inventory.stock.adjust"), IdempotencyMiddleware.requireForMutations(), controller.approveSession);
        this.router.get("/discrepancies", AuthorizationMiddleware.requirePermissions("inventory.stock.count"), controller.listDiscrepancies);
        // ─── Stock Take Dashboard & List ─────────────────────────────────────────
        this.router.get("/stock-take/dashboard", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getStockTakeDashboard);
        this.router.get("/stock-take/plans", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.listStockTakePlans);
        this.router.get("/stock-take/plans/export", AuthorizationMiddleware.requirePermissions("stock_take.export"), controller.exportStockTakePlans);
        // ─── Stock Take Plan CRUD ────────────────────────────────────────────────
        this.router.post("/stock-take/plans", AuthorizationMiddleware.requirePermissions("stock_take.create"), IdempotencyMiddleware.requireForMutations(), controller.createStockTakePlan);
        this.router.get("/stock-take/plans/:planId", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getStockTakePlan);
        this.router.put("/stock-take/plans/:planId", AuthorizationMiddleware.requirePermissions("stock_take.edit"), controller.updateStockTakePlan);
        // ─── Stock Take Plan Lifecycle ───────────────────────────────────────────
        this.router.post("/stock-take/plans/:planId/schedule", AuthorizationMiddleware.requirePermissions("stock_take.schedule"), IdempotencyMiddleware.requireForMutations(), controller.scheduleStockTakePlan);
        this.router.post("/stock-take/plans/:planId/start", AuthorizationMiddleware.requirePermissions("stock_take.start"), IdempotencyMiddleware.requireForMutations(), controller.startStockTakePlan);
        this.router.post("/stock-take/plans/:planId/pause", AuthorizationMiddleware.requirePermissions("stock_take.start"), IdempotencyMiddleware.requireForMutations(), controller.pauseStockTakePlan);
        this.router.post("/stock-take/plans/:planId/resume", AuthorizationMiddleware.requirePermissions("stock_take.start"), IdempotencyMiddleware.requireForMutations(), controller.resumeStockTakePlan);
        this.router.post("/stock-take/plans/:planId/complete", AuthorizationMiddleware.requirePermissions("stock_take.complete"), IdempotencyMiddleware.requireForMutations(), controller.completeStockTakePlan);
        this.router.post("/stock-take/plans/:planId/cancel", AuthorizationMiddleware.requirePermissions("stock_take.edit"), IdempotencyMiddleware.requireForMutations(), controller.cancelStockTakePlan);
        // ─── Coverage ────────────────────────────────────────────────────────────
        this.router.get("/stock-take/plans/:planId/coverage", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getCoverageSummary);
        this.router.post("/stock-take/plans/calculate-coverage", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.calculateCoverage);
        // ─── Approval Workflow ───────────────────────────────────────────────────
        this.router.post("/stock-take/plans/:planId/submit-approval", AuthorizationMiddleware.requirePermissions("stock_take.complete"), IdempotencyMiddleware.requireForMutations(), controller.submitForApproval);
        this.router.post("/stock-take/plans/:planId/approve", AuthorizationMiddleware.requirePermissions("stock_take.approve"), IdempotencyMiddleware.requireForMutations(), controller.approvePlan);
        this.router.post("/stock-take/plans/:planId/reject", AuthorizationMiddleware.requirePermissions("stock_take.approve"), IdempotencyMiddleware.requireForMutations(), controller.rejectPlan);
        // ─── Inventory Lock ───────────────────────────────────────────────────────
        this.router.get("/stock-take/inventory-lock", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getInventoryLockStatus);
        this.router.post("/stock-take/inventory-lock", AuthorizationMiddleware.requirePermissions("stock_take.lock"), IdempotencyMiddleware.requireForMutations(), controller.lockInventory);
        this.router.delete("/stock-take/inventory-lock", AuthorizationMiddleware.requirePermissions("stock_take.lock"), controller.unlockInventory);
        // ─── Stock Take Detail Tabs & Actions ────────────────────────────────────
        this.router.post("/stock-take/plans/:planId/extend-deadline", AuthorizationMiddleware.requirePermissions("stock_take.edit"), IdempotencyMiddleware.requireForMutations(), controller.extendDeadline);
        this.router.post("/stock-take/plans/:planId/reassign-team", AuthorizationMiddleware.requirePermissions("stock_take.edit"), IdempotencyMiddleware.requireForMutations(), controller.reassignTeam);
        this.router.get("/stock-take/plans/:planId/progress", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getPlanProgress);
        this.router.get("/stock-take/plans/:planId/variances", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getPlanVariances);
        this.router.get("/stock-take/plans/:planId/team-performance", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getTeamPerformance);
        this.router.get("/stock-take/plans/:planId/activity-log", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.getActivityLog);
        this.router.get("/stock-take/plans/:planId/export-count-sheets", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.exportCountSheets);
        this.router.get("/stock-take/plans/:planId/print-count-sheets", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.printCountSheets);
        this.router.get("/stock-take/plans/:planId/variance-report", AuthorizationMiddleware.requirePermissions("stock_take.view"), controller.downloadVarianceReport);
    }
    getRouter() {
        return this.router;
    }
}

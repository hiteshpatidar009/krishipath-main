import { Router } from "express";
import { AuthorizationMiddleware, CompanyGuard, IdempotencyMiddleware, SharedAuthMiddleware, } from "../../../shared/security";
import { auditEvent } from "../../../shared/audit";
export class QualityManagementRoutes {
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
        this.router.get("/rules", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.listRules);
        this.router.post("/rules", AuthorizationMiddleware.requirePermissions("quality.inspection.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.rule.create", entityType: "quality_rule" }), this.controller.createRule);
        this.router.get("/checklists", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.listChecklists);
        this.router.post("/checklists", AuthorizationMiddleware.requirePermissions("quality.inspection.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.checklist.create", entityType: "quality_checklist" }), this.controller.createChecklist);
        this.router.get("/inspections", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.listInspections);
        this.router.post("/inspections", AuthorizationMiddleware.requirePermissions("quality.inspection.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.inspection.create", entityType: "quality_inspection" }), this.controller.createInspection);
        this.router.get("/inspections/:inspectionId", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.getInspection);
        this.router.post("/inspections/:inspectionId/defects", AuthorizationMiddleware.requirePermissions("quality.inspection.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.defect.create", entityType: "quality_defect" }), this.controller.addDefect);
        this.router.post("/inspections/:inspectionId/pass", AuthorizationMiddleware.requirePermissions("quality.inspection.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.inspection.pass", entityType: "quality_inspection" }), this.controller.pass);
        this.router.post("/inspections/:inspectionId/fail", AuthorizationMiddleware.requirePermissions("quality.inspection.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.inspection.fail", entityType: "quality_inspection" }), this.controller.fail);
        this.router.post("/inspections/:inspectionId/reject", AuthorizationMiddleware.requirePermissions("quality.quarantine.manage"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.inspection.reject", entityType: "quality_inspection" }), this.controller.reject);
        this.router.post("/inspections/:inspectionId/quarantine", AuthorizationMiddleware.requirePermissions("quality.quarantine.manage"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.inventory.quarantine", entityType: "quality_inspection" }), this.controller.quarantine);
        this.router.post("/inspections/:inspectionId/release", AuthorizationMiddleware.requirePermissions("quality.quarantine.manage"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "quality-management", action: "quality.inventory.release", entityType: "quality_inspection" }), this.controller.release);
        this.router.get("/reports/summary", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.summary);
        this.router.get("/reports/failure-trends", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.failureTrends);
        this.router.get("/reports/supplier-score", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.supplierScore);
        this.router.get("/reports/warehouse-score", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.warehouseScore);
        this.router.get("/reports/product-score", AuthorizationMiddleware.requirePermissions("quality.inspection.read"), this.controller.productScore);
    }
}

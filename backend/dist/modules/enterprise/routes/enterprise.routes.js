import { Router } from "express";
import { AuthorizationMiddleware, CompanyGuard, IdempotencyMiddleware, SharedAuthMiddleware, } from "../../../shared/security";
export class EnterpriseRoutes {
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
        this.router.get("/", AuthorizationMiddleware.requirePermissions("enterprise.view"), this.controller.list);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("enterprise.create"), IdempotencyMiddleware.requireForMutations(), this.controller.create);
        this.router.get("/hierarchy/tree", AuthorizationMiddleware.requirePermissions("enterprise.manage_hierarchy"), this.controller.hierarchyTree);
        this.router.get("/:enterpriseId", AuthorizationMiddleware.requirePermissions("enterprise.view"), this.controller.get);
        this.router.patch("/:enterpriseId", AuthorizationMiddleware.requirePermissions("enterprise.update"), IdempotencyMiddleware.requireForMutations(), this.controller.update);
        this.router.delete("/:enterpriseId", AuthorizationMiddleware.requirePermissions("enterprise.delete"), IdempotencyMiddleware.requireForMutations(), this.controller.archive);
        this.router.post("/:enterpriseId/activate", AuthorizationMiddleware.requirePermissions("enterprise.update"), IdempotencyMiddleware.requireForMutations(), this.controller.activate);
        this.router.post("/:enterpriseId/deactivate", AuthorizationMiddleware.requirePermissions("enterprise.update"), IdempotencyMiddleware.requireForMutations(), this.controller.deactivate);
        this.router.post("/:enterpriseId/move", AuthorizationMiddleware.requirePermissions("enterprise.manage_hierarchy"), IdempotencyMiddleware.requireForMutations(), this.controller.move);
        this.router.get("/:enterpriseId/configuration", AuthorizationMiddleware.requirePermissions("enterprise.configure"), this.controller.getConfiguration);
        this.router.patch("/:enterpriseId/configuration", AuthorizationMiddleware.requirePermissions("enterprise.configure"), IdempotencyMiddleware.requireForMutations(), this.controller.replaceConfiguration);
        this.router.post("/:enterpriseId/configuration/inherit-all", AuthorizationMiddleware.requirePermissions("enterprise.configure"), IdempotencyMiddleware.requireForMutations(), this.controller.inheritAllConfiguration);
        this.router.post("/:enterpriseId/configuration/copy", AuthorizationMiddleware.requirePermissions("enterprise.configure"), IdempotencyMiddleware.requireForMutations(), this.controller.copyConfiguration);
        this.router.delete("/:enterpriseId/configuration/overrides/:settingKey", AuthorizationMiddleware.requirePermissions("enterprise.configure"), IdempotencyMiddleware.requireForMutations(), this.controller.resetConfigurationOverride);
        this.router.get("/:enterpriseId/documents", AuthorizationMiddleware.requirePermissions("enterprise.manage_documents"), this.controller.listDocuments);
        this.router.post("/:enterpriseId/documents", AuthorizationMiddleware.requirePermissions("enterprise.manage_documents"), IdempotencyMiddleware.requireForMutations(), this.controller.addDocument);
        this.router.delete("/:enterpriseId/documents/:documentId", AuthorizationMiddleware.requirePermissions("enterprise.manage_documents"), IdempotencyMiddleware.requireForMutations(), this.controller.deleteDocument);
        this.router.get("/:enterpriseId/audit-logs", AuthorizationMiddleware.requirePermissions("enterprise.view_audit_logs"), this.controller.auditLogs);
        this.router.get("/:enterpriseId/companies", AuthorizationMiddleware.requirePermissions("enterprise.view"), this.controller.listCompanies);
        this.router.post("/:enterpriseId/companies", AuthorizationMiddleware.requirePermissions("enterprise.update"), IdempotencyMiddleware.requireForMutations(), this.controller.addCompany);
        this.router.delete("/:enterpriseId/companies/:companyId", AuthorizationMiddleware.requirePermissions("enterprise.update"), IdempotencyMiddleware.requireForMutations(), this.controller.removeCompany);
        this.router.get("/:enterpriseId/users", AuthorizationMiddleware.requirePermissions("enterprise.assign_users"), this.controller.listUsers);
        this.router.post("/:enterpriseId/users", AuthorizationMiddleware.requirePermissions("enterprise.assign_users"), IdempotencyMiddleware.requireForMutations(), this.controller.addUser);
        this.router.delete("/:enterpriseId/users/:userId", AuthorizationMiddleware.requirePermissions("enterprise.assign_users"), IdempotencyMiddleware.requireForMutations(), this.controller.removeUser);
        this.router.get("/:enterpriseId/transfers", AuthorizationMiddleware.requirePermissions("enterprise.transfer.read"), this.controller.listTransfers);
        this.router.post("/:enterpriseId/transfers", AuthorizationMiddleware.requirePermissions("enterprise.transfer.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createTransfer);
        this.router.get("/:enterpriseId/transfers/:transferId", AuthorizationMiddleware.requirePermissions("enterprise.transfer.read"), this.controller.getTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/submit", AuthorizationMiddleware.requirePermissions("enterprise.transfer.update"), IdempotencyMiddleware.requireForMutations(), this.controller.submitTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/approve", AuthorizationMiddleware.requirePermissions("enterprise.transfer.approve"), IdempotencyMiddleware.requireForMutations(), this.controller.approveTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/reject", AuthorizationMiddleware.requirePermissions("enterprise.transfer.reject"), IdempotencyMiddleware.requireForMutations(), this.controller.rejectTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/dispatch", AuthorizationMiddleware.requirePermissions("enterprise.transfer.dispatch"), IdempotencyMiddleware.requireForMutations(), this.controller.dispatchTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/receive", AuthorizationMiddleware.requirePermissions("enterprise.transfer.receive"), IdempotencyMiddleware.requireForMutations(), this.controller.receiveTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/complete", AuthorizationMiddleware.requirePermissions("enterprise.transfer.update"), IdempotencyMiddleware.requireForMutations(), this.controller.completeTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/settle", AuthorizationMiddleware.requirePermissions("enterprise.transfer.settle"), IdempotencyMiddleware.requireForMutations(), this.controller.settleTransfer);
        this.router.post("/:enterpriseId/transfers/:transferId/cancel", AuthorizationMiddleware.requirePermissions("enterprise.transfer.cancel"), IdempotencyMiddleware.requireForMutations(), this.controller.cancelTransfer);
        this.router.get("/:enterpriseId/invoices", AuthorizationMiddleware.requirePermissions("enterprise.billing.read"), this.controller.listInvoices);
        this.router.post("/:enterpriseId/invoices", AuthorizationMiddleware.requirePermissions("enterprise.billing.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createInvoice);
        this.router.get("/:enterpriseId/reports/summary", AuthorizationMiddleware.requirePermissions("enterprise.reporting.read"), this.controller.reportingSummary);
    }
}

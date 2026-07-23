import { Router } from "express";
import { AuthorizationMiddleware, CompanyGuard, IdempotencyMiddleware, SharedAuthMiddleware, } from "../../../shared/security";
import { auditEvent } from "../../../shared/audit";
export class FinanceAccountingRoutes {
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
        this.router.get("/invoices", AuthorizationMiddleware.requirePermissions("finance.report.read"), this.controller.listInvoices);
        this.router.post("/invoices", AuthorizationMiddleware.requirePermissions("sales.invoice.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "finance-accounting", action: "finance.invoice.create", entityType: "invoice" }), this.controller.createInvoice);
        this.router.get("/invoices/:invoiceId", AuthorizationMiddleware.requirePermissions("finance.report.read"), this.controller.getInvoice);
        this.router.patch("/invoices/:invoiceId", AuthorizationMiddleware.requirePermissions("sales.invoice.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "finance-accounting", action: "finance.invoice.update", entityType: "invoice" }), this.controller.updateInvoice);
        this.router.post("/invoices/:invoiceId/approve", AuthorizationMiddleware.requirePermissions("finance.payment.approve"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "finance-accounting", action: "finance.invoice.approve", entityType: "invoice" }), this.controller.approveInvoice);
        this.router.post("/invoices/:invoiceId/send", AuthorizationMiddleware.requirePermissions("sales.invoice.create"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "finance-accounting", action: "finance.invoice.send", entityType: "invoice" }), this.controller.sendInvoice);
        this.router.post("/invoices/:invoiceId/cancel", AuthorizationMiddleware.requirePermissions("finance.payment.approve"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "finance-accounting", action: "finance.invoice.cancel", entityType: "invoice" }), this.controller.cancelInvoice);
        this.router.post("/invoices/:invoiceId/payments", AuthorizationMiddleware.requirePermissions("finance.payment.reconcile"), IdempotencyMiddleware.requireForMutations(), auditEvent({ module: "finance-accounting", action: "finance.payment.record", entityType: "payment" }), this.controller.recordPayment);
        this.router.get("/chart-of-accounts", AuthorizationMiddleware.requirePermissions("finance.report.read"), this.controller.chartOfAccounts);
        this.router.get("/accounting-events", AuthorizationMiddleware.requirePermissions("finance.journal.post"), this.controller.accountingEvents);
        this.router.get("/reports/ar-summary", AuthorizationMiddleware.requirePermissions("finance.ar.read"), this.controller.arSummary);
        this.router.get("/reports/ap-summary", AuthorizationMiddleware.requirePermissions("finance.ap.read"), this.controller.apSummary);
    }
}

import { Router } from "express";
import { SharedAuthMiddleware } from "../../../shared/security/middlewares/auth.middleware";
import { AuthorizationMiddleware } from "../../../shared/security/middlewares/authorization.middleware";
import { SchemaValidationMiddleware } from "../../../shared/security/middlewares/schema-validation.middleware";
import { BillingPermission } from "../constants/billing.constants";
import { autoPaySchema, cancelSubscriptionSchema, createCreditSchema, createInvoiceSchema, createPaymentSchema, createRefundSchema, createSubscriptionSchema, disableAutoPaySchema, downgradePlanSchema, idParamSchema, listBillingSchema, purchasePlanSchema, recordUsageSchema, renewPlanSchema, retryPaymentSchema, stripeWebhookSchema, updateSubscriptionSchema, upgradePlanSchema, createPaymentProfileSchema, updatePaymentProfileSchema, } from "../validators/billing.validator";
import { BillingIdempotencyMiddleware } from "../middleware/idempotency.middleware";
export class BillingRoutes {
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
        this.router.post("/subscriptions", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionActivate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(createSubscriptionSchema), this.controller.createSubscription);
        this.router.get("/subscriptions", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionRead), SchemaValidationMiddleware.validate(listBillingSchema, "query"), this.controller.listSubscriptions);
        this.router.get("/subscriptions/current", SharedAuthMiddleware.useUserContext, this.controller.currentSubscriptionDashboard);
        this.router.post("/subscriptions/purchase", SharedAuthMiddleware.useUserContext, SchemaValidationMiddleware.validate(purchasePlanSchema), this.controller.purchasePlan);
        this.router.post("/subscriptions/renew", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionActivate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(renewPlanSchema), this.controller.renewCurrentPlan);
        this.router.post("/subscriptions/upgrade", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(upgradePlanSchema), this.controller.upgradePlan);
        this.router.post("/subscriptions/downgrade", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(downgradePlanSchema), this.controller.downgradePlan);
        this.router.post("/subscriptions/auto-pay/enable", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(autoPaySchema), this.controller.enableAutoPay);
        this.router.post("/subscriptions/auto-pay/disable", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(disableAutoPaySchema), this.controller.disableAutoPay);
        this.router.get("/subscriptions/:id", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionRead), SchemaValidationMiddleware.validate(idParamSchema, "params"), this.controller.getSubscription);
        this.router.patch("/subscriptions/:id", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(idParamSchema, "params"), SchemaValidationMiddleware.validate(updateSubscriptionSchema), this.controller.updateSubscription);
        this.router.post("/subscriptions/:id/cancel", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(idParamSchema, "params"), SchemaValidationMiddleware.validate(cancelSubscriptionSchema), this.controller.cancelSubscription);
        this.router.post("/subscriptions/:id/renew", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionActivate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(idParamSchema, "params"), this.controller.renewSubscription);
        this.router.post("/invoices", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(createInvoiceSchema), this.controller.createInvoice);
        this.router.get("/invoices", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.InvoiceRead), SchemaValidationMiddleware.validate(listBillingSchema, "query"), this.controller.listInvoices);
        this.router.get("/invoices/:id", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.InvoiceRead), SchemaValidationMiddleware.validate(idParamSchema, "params"), this.controller.getInvoice);
        this.router.post("/payments", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.PaymentApprove), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(createPaymentSchema), this.controller.createPayment);
        this.router.get("/payments", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.PaymentReconcile), SchemaValidationMiddleware.validate(listBillingSchema, "query"), this.controller.listPayments);
        this.router.post("/payments/retry", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.PaymentApprove), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(retryPaymentSchema), this.controller.retryPayment);
        this.router.post("/refunds", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.PaymentApprove), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(createRefundSchema), this.controller.createRefund);
        this.router.post("/credits", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.PaymentApprove), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(createCreditSchema), this.controller.createCredit);
        this.router.get("/credits", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.InvoiceRead), SchemaValidationMiddleware.validate(listBillingSchema, "query"), this.controller.listCredits);
        this.router.get("/usage", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.InvoiceRead), SchemaValidationMiddleware.validate(listBillingSchema, "query"), this.controller.listUsage);
        this.router.post("/usage", SharedAuthMiddleware.use, AuthorizationMiddleware.requirePermissions(BillingPermission.SubscriptionUpdate), BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(recordUsageSchema), this.controller.recordUsage);
        this.router.post("/payment-profiles", SharedAuthMiddleware.useUserContext, SchemaValidationMiddleware.validate(createPaymentProfileSchema), this.controller.createPaymentProfile);
        this.router.get("/payment-profiles", SharedAuthMiddleware.useUserContext, this.controller.listPaymentProfiles);
        this.router.patch("/payment-profiles/:id", SharedAuthMiddleware.useUserContext, BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(idParamSchema, "params"), SchemaValidationMiddleware.validate(updatePaymentProfileSchema), this.controller.updatePaymentProfile);
        this.router.delete("/payment-profiles/:id", SharedAuthMiddleware.useUserContext, BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(idParamSchema, "params"), this.controller.removePaymentProfile);
        this.router.post("/payment-profiles/:id/default", SharedAuthMiddleware.useUserContext, BillingIdempotencyMiddleware.requireForUnsafe, SchemaValidationMiddleware.validate(idParamSchema, "params"), this.controller.setDefaultPaymentProfile);
        this.router.post("/webhooks/stripe", SchemaValidationMiddleware.validate(stripeWebhookSchema), this.controller.handleStripeWebhook);
    }
}

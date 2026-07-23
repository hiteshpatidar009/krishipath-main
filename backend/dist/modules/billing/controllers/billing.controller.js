import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { StripeSignatureUtil } from "../utils/stripe-signature.util";
import { env } from "../../../infrastructure/config/env";
export class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    createSubscription = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.createSubscription(request.body, this.context(request)), "Subscription created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    listSubscriptions = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.listSubscriptions(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    getSubscription = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.getSubscription(this.paramId(request), this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    currentSubscriptionDashboard = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.currentSubscriptionDashboard(this.context(request)), "Current subscription loaded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    purchasePlan = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.purchasePlan(request.body, this.context(request)), "Subscription purchase started");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    renewCurrentPlan = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.renewCurrentPlan(request.body, this.context(request)), "Subscription renewed");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    upgradePlan = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.upgradePlan(request.body, this.context(request)), "Subscription upgraded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    downgradePlan = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.downgradePlan(request.body, this.context(request)), "Subscription downgrade handled");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    enableAutoPay = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.enableAutoPay(request.body, this.context(request)), "Auto pay enabled");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    disableAutoPay = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.disableAutoPay(request.body, this.context(request)), "Auto pay disabled");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    updateSubscription = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.updateSubscription(this.paramId(request), request.body, this.context(request)), "Subscription updated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    cancelSubscription = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.cancelSubscription(this.paramId(request), request.body.reason, request.body.cancelAtPeriodEnd, this.context(request)), "Subscription cancelled");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    renewSubscription = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.renewSubscription(this.paramId(request), this.context(request)), "Subscription renewed");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    createInvoice = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.createInvoice(request.body, this.context(request)), "Invoice created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    listInvoices = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.listInvoices(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    getInvoice = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.getInvoice(this.paramId(request), this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    createPayment = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.createPayment(request.body, this.context(request)), "Payment recorded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    listPayments = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.listPayments(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    retryPayment = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.retryPayment(request.body, this.context(request)), "Payment retry completed");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    createRefund = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.createRefund(request.body, this.context(request)), "Refund created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    createCredit = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.createCredit(request.body, this.context(request)), "Credit created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    listCredits = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.listCredits(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    listUsage = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.listUsage(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    recordUsage = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.recordUsage(request.body, this.context(request)), "Usage recorded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    handleStripeWebhook = async (request, response, next) => {
        try {
            const rawBody = Buffer.isBuffer(request.body)
                ? request.body.toString("utf8")
                : JSON.stringify(request.body);
            const signatureOk = StripeSignatureUtil.verify(rawBody, request.header("stripe-signature"), env.stripeWebhookSecret);
            if (!signatureOk) {
                response.status(400).json({ success: false, message: "Invalid Stripe signature" });
                return;
            }
            const event = JSON.parse(rawBody);
            ApiResponse.ok(response, await this.billingService.handleStripeWebhook(event, this.context(request)), "Webhook accepted");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    createPaymentProfile = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.billingService.createPaymentProfile(request.body, this.context(request)), "Payment profile created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    listPaymentProfiles = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.listPaymentProfiles(this.context(request)), "Payment profiles loaded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    updatePaymentProfile = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.updatePaymentProfile(this.paramId(request), request.body, this.context(request)), "Payment profile updated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    removePaymentProfile = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.removePaymentProfile(this.paramId(request), this.context(request)), "Payment profile removed");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    setDefaultPaymentProfile = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.billingService.setDefaultPaymentProfile(this.paramId(request), this.context(request)), "Default payment profile updated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "billing");
        }
    };
    context(request) {
        return {
            securityContext: request.securityContext ?? { roles: [], permissions: [], requestFingerprint: "" },
            idempotencyKey: request.header("Idempotency-Key") ?? undefined,
            ipAddress: request.ip,
            userAgent: request.header("user-agent"),
            requestId: request.requestId,
        };
    }
    paramId(request) {
        const value = request.params.id;
        return Array.isArray(value) ? value[0] : value;
    }
}

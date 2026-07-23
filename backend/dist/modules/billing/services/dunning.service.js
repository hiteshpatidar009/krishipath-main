import { BILLING_DEFAULTS, RetryStatus, SubscriptionState } from "../constants/billing.constants";
import { BillingDateUtil } from "../utils/date.util";
export class DunningService {
    repository;
    integrations;
    constructor(repository, integrations) {
        this.repository = repository;
        this.integrations = integrations;
    }
    async handlePaymentFailure(payment, context) {
        if (!payment.companyId) {
            return;
        }
        const existingRetries = await this.repository.countRetriesForPayment(payment.companyId, payment.id);
        if (existingRetries < BILLING_DEFAULTS.maxRetryAttempts) {
            await this.repository.createRetry({
                companyId: payment.companyId,
                paymentId: payment.id,
                invoiceId: payment.invoiceId,
                subscriptionId: payment.subscriptionId,
                attemptNumber: existingRetries + 1,
                status: RetryStatus.Scheduled,
                scheduledAt: BillingDateUtil.addHours(new Date(), BILLING_DEFAULTS.retryDelaysHours[existingRetries] ?? 168),
                processedAt: null,
                failureReason: payment.failureReason,
            });
            await this.integrations.notify({
                type: "billing.payment_retry_scheduled",
                title: "Payment retry scheduled",
                message: `Billing payment retry #${existingRetries + 1} has been scheduled.`,
                entityType: "billing_payment",
                entityId: payment.id,
                priority: "high",
            }, context);
            return;
        }
        await this.repository.updateSubscription(payment.companyId, payment.subscriptionId, {
            status: SubscriptionState.PastDue,
        });
        await this.integrations.notify({
            type: "billing.subscription_past_due",
            title: "Subscription past due",
            message: "Payment retries were exhausted. Subscription is now past due.",
            entityType: "billing_subscription",
            entityId: payment.subscriptionId,
            priority: "high",
        }, context);
        await this.integrations.emitWorkflow("billing.dunning.exhausted", {
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            subscriptionId: payment.subscriptionId,
        }, context);
    }
    async suspendPastDueSubscription(companyId, subscriptionId, context) {
        await this.repository.updateSubscription(companyId, subscriptionId, {
            status: SubscriptionState.Suspended,
        });
        await this.integrations.notify({
            type: "billing.subscription_suspended",
            title: "Subscription suspended",
            message: "Subscription access has been suspended after unresolved dunning.",
            entityType: "billing_subscription",
            entityId: subscriptionId,
            priority: "high",
        }, context);
    }
}

export const BILLING_MODULE_NAME = "billing";
export var BillingPermission;
(function (BillingPermission) {
    BillingPermission["SubscriptionRead"] = "billing.subscription.read";
    BillingPermission["SubscriptionUpdate"] = "billing.subscription.update";
    BillingPermission["SubscriptionActivate"] = "billing.subscription.activate";
    BillingPermission["InvoiceRead"] = "billing.invoice.read";
    BillingPermission["PaymentApprove"] = "finance.payment.approve";
    BillingPermission["PaymentReconcile"] = "finance.payment.reconcile";
})(BillingPermission || (BillingPermission = {}));
export var SubscriptionState;
(function (SubscriptionState) {
    SubscriptionState["Trial"] = "TRIAL";
    SubscriptionState["Active"] = "ACTIVE";
    SubscriptionState["PastDue"] = "PAST_DUE";
    SubscriptionState["Cancelled"] = "CANCELLED";
    SubscriptionState["Expired"] = "EXPIRED";
    SubscriptionState["Suspended"] = "SUSPENDED";
    SubscriptionState["Queued"] = "QUEUED";
})(SubscriptionState || (SubscriptionState = {}));
export var BillingCycle;
(function (BillingCycle) {
    BillingCycle["Trial"] = "trial";
    BillingCycle["Monthly"] = "monthly";
    BillingCycle["Quarterly"] = "quarterly";
    BillingCycle["Yearly"] = "yearly";
    BillingCycle["Annual"] = "annual";
})(BillingCycle || (BillingCycle = {}));
export var RenewalMode;
(function (RenewalMode) {
    RenewalMode["Auto"] = "auto";
    RenewalMode["Manual"] = "manual";
})(RenewalMode || (RenewalMode = {}));
export var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["Card"] = "card";
    PaymentMethodType["CreditCard"] = "credit_card";
    PaymentMethodType["DebitCard"] = "debit_card";
    PaymentMethodType["Upi"] = "upi";
    PaymentMethodType["GooglePay"] = "google_pay";
    PaymentMethodType["ApplePay"] = "apple_pay";
    PaymentMethodType["Link"] = "link";
    PaymentMethodType["BankAccount"] = "bank_account";
    PaymentMethodType["Regional"] = "regional";
})(PaymentMethodType || (PaymentMethodType = {}));
export var PaymentMethodStatus;
(function (PaymentMethodStatus) {
    PaymentMethodStatus["Active"] = "ACTIVE";
    PaymentMethodStatus["Removed"] = "REMOVED";
})(PaymentMethodStatus || (PaymentMethodStatus = {}));
export var SubscriptionChangePolicy;
(function (SubscriptionChangePolicy) {
    SubscriptionChangePolicy["Immediate"] = "immediate";
    SubscriptionChangePolicy["NextCycle"] = "next_cycle";
})(SubscriptionChangePolicy || (SubscriptionChangePolicy = {}));
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["Draft"] = "DRAFT";
    InvoiceStatus["Open"] = "OPEN";
    InvoiceStatus["Paid"] = "PAID";
    InvoiceStatus["PartiallyPaid"] = "PARTIALLY_PAID";
    InvoiceStatus["Void"] = "VOID";
    InvoiceStatus["Overdue"] = "OVERDUE";
})(InvoiceStatus || (InvoiceStatus = {}));
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "PENDING";
    PaymentStatus["Succeeded"] = "SUCCEEDED";
    PaymentStatus["Failed"] = "FAILED";
    PaymentStatus["Refunded"] = "REFUNDED";
    PaymentStatus["PartiallyRefunded"] = "PARTIALLY_REFUNDED";
})(PaymentStatus || (PaymentStatus = {}));
export var RetryStatus;
(function (RetryStatus) {
    RetryStatus["Scheduled"] = "SCHEDULED";
    RetryStatus["Processing"] = "PROCESSING";
    RetryStatus["Succeeded"] = "SUCCEEDED";
    RetryStatus["Failed"] = "FAILED";
    RetryStatus["Exhausted"] = "EXHAUSTED";
})(RetryStatus || (RetryStatus = {}));
export var CreditStatus;
(function (CreditStatus) {
    CreditStatus["Available"] = "AVAILABLE";
    CreditStatus["Applied"] = "APPLIED";
    CreditStatus["Expired"] = "EXPIRED";
})(CreditStatus || (CreditStatus = {}));
export var RefundStatus;
(function (RefundStatus) {
    RefundStatus["Pending"] = "PENDING";
    RefundStatus["Succeeded"] = "SUCCEEDED";
    RefundStatus["Failed"] = "FAILED";
})(RefundStatus || (RefundStatus = {}));
export const BILLING_DEFAULTS = {
    currencyCode: "USD",
    invoiceDueDays: 7,
    trialDays: 15,
    maxRetryAttempts: 3,
    retryDelaysHours: [24, 72, 168],
    idempotencyTtlHours: 24,
    taxRatePercent: 18,
    gracePeriodDays: 7,
    renewalReminderDays: [3, 7, 15],
};
export const BILLING_SORT_FIELDS = new Set([
    "createdAt",
    "updatedAt",
    "dueDate",
    "status",
    "totalAmount",
]);

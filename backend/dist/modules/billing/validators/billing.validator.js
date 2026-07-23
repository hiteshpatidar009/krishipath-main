import { z } from "zod";
import { BillingCycle, InvoiceStatus, PaymentMethodType, PaymentStatus, RenewalMode, SubscriptionChangePolicy, SubscriptionState, } from "../constants/billing.constants";
const money = z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a decimal money string");
const isoDate = z.coerce.date();
const uuid = z.string().uuid();
const paymentStatusAliases = {
    PENDING: PaymentStatus.Pending,
    PROCESSING: PaymentStatus.Pending,
    OPEN: PaymentStatus.Pending,
    SUCCEEDED: PaymentStatus.Succeeded,
    SUCCESS: PaymentStatus.Succeeded,
    SUCCESSFUL: PaymentStatus.Succeeded,
    PAID: PaymentStatus.Succeeded,
    COMPLETED: PaymentStatus.Succeeded,
    FAILED: PaymentStatus.Failed,
    FAILURE: PaymentStatus.Failed,
    REFUNDED: PaymentStatus.Refunded,
    PARTIALLY_REFUNDED: PaymentStatus.PartiallyRefunded,
    PARTIAL_REFUND: PaymentStatus.PartiallyRefunded,
    PARTIALLYREFUNDED: PaymentStatus.PartiallyRefunded,
};
const paymentStatusSchema = z.preprocess((value) => {
    if (typeof value !== "string")
        return value;
    const normalized = value.trim().replace(/[\s-]+/g, "_").toUpperCase();
    return paymentStatusAliases[normalized] ?? normalized;
}, z.nativeEnum(PaymentStatus));
const optionalTrustToken = z.preprocess((value) => value === "" ? undefined : value, z.string().trim().min(20).optional());
const optionalMfaCode = z.preprocess((value) => value === "" ? undefined : value, z.string().trim().regex(/^\d{6}$/, "MFA code must be a 6 digit code").optional());
const billingDeviceContextSchema = z.object({
    mfaTrustToken: optionalTrustToken,
    mfaTrustSessionId: z.string().trim().max(150).optional(),
    mfaMethod: z.enum(["auth_app_otp", "authenticator_app"]).optional(),
    mfaCode: optionalMfaCode,
    totpCode: optionalMfaCode,
    authenticatorCode: optionalMfaCode,
    mfaSetupToken: uuid.optional(),
    setupToken: uuid.optional(),
    mfaSecret: z.string().trim().min(16).optional(),
    secret: z.string().trim().min(16).optional(),
    deviceId: z.string().trim().max(150).optional(),
    deviceName: z.string().trim().max(150).optional(),
    deviceType: z.string().trim().max(80).optional(),
    operatingSystem: z.string().trim().max(120).optional(),
    browser: z.string().trim().max(120).optional(),
});
export const listBillingSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    sortBy: z.string().trim().max(64).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    status: z.string().trim().max(40).optional(),
    fromDate: isoDate.optional(),
    toDate: isoDate.optional(),
});
export const idParamSchema = z.object({
    id: uuid,
});
export const createSubscriptionSchema = z.object({
    planId: uuid,
    billingCycle: z.nativeEnum(BillingCycle),
    startDate: isoDate.optional(),
    trialDays: z.number().int().min(0).max(90).optional(),
    autoRenew: z.boolean().default(true),
    gatewayCustomerId: z.string().trim().max(150).optional(),
    gatewaySubscriptionId: z.string().trim().max(150).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
});
export const purchasePlanSchema = billingDeviceContextSchema.extend({
    planId: uuid,
    billingCycle: z.nativeEnum(BillingCycle),
    renewalMode: z.nativeEnum(RenewalMode).default(RenewalMode.Auto),
    paymentMethodType: z.literal(PaymentMethodType.Card).default(PaymentMethodType.Card),
    paymentProfileId: uuid.optional(),
    trialOnly: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const pendingTenantCheckoutSchema = z.object({
    planId: uuid,
    billingCycle: z.nativeEnum(BillingCycle),
    renewalMode: z.nativeEnum(RenewalMode).default(RenewalMode.Auto),
    metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const renewPlanSchema = billingDeviceContextSchema.extend({
    subscriptionId: uuid.optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const upgradePlanSchema = billingDeviceContextSchema.extend({
    subscriptionId: uuid.optional(),
    targetPlanId: uuid,
    billingCycle: z.nativeEnum(BillingCycle).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const downgradePlanSchema = z.object({
    subscriptionId: uuid.optional(),
    targetPlanId: uuid,
    policy: z.nativeEnum(SubscriptionChangePolicy).default(SubscriptionChangePolicy.NextCycle),
    reason: z.string().trim().max(500).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const autoPaySchema = billingDeviceContextSchema.extend({
    subscriptionId: uuid.optional(),
}).strict();
export const disableAutoPaySchema = z.object({
    subscriptionId: uuid.optional(),
}).strict();
export const retryPaymentSchema = billingDeviceContextSchema.extend({
    paymentId: uuid,
}).strict();
export const updateSubscriptionSchema = z.object({
    planId: uuid.optional(),
    billingCycle: z.nativeEnum(BillingCycle).optional(),
    status: z.nativeEnum(SubscriptionState).optional(),
    autoRenew: z.boolean().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
    gatewayCustomerId: z.string().trim().max(150).nullable().optional(),
    gatewaySubscriptionId: z.string().trim().max(150).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();
export const cancelSubscriptionSchema = z.object({
    reason: z.string().trim().min(3).max(500),
    cancelAtPeriodEnd: z.boolean().default(true),
});
export const createInvoiceSchema = z.object({
    subscriptionId: uuid,
    subtotalAmount: money,
    taxAmount: money.default("0.00"),
    discountAmount: money.default("0.00"),
    currencyCode: z.string().length(3).default("USD"),
    dueDate: isoDate.optional(),
    periodStart: isoDate,
    periodEnd: isoDate,
    status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.Open),
    metadata: z.record(z.string(), z.unknown()).default({}),
});
export const createPaymentSchema = z.object({
    invoiceId: uuid,
    gateway: z.enum(["stripe", "manual"]),
    gatewayPaymentId: z.string().trim().max(150).optional(),
    amount: money,
    currencyCode: z.string().length(3).default("USD"),
    status: paymentStatusSchema.default(PaymentStatus.Pending),
    failureReason: z.string().trim().max(500).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
});
export const createRefundSchema = z.object({
    paymentId: uuid,
    amount: money,
    reason: z.string().trim().min(3).max(500),
    metadata: z.record(z.string(), z.unknown()).default({}),
});
export const createCreditSchema = z.object({
    amount: money.refine((value) => Number(value) > 0, "Credit amount must be positive"),
    currencyCode: z.string().length(3).default("USD"),
    reason: z.string().trim().min(3).max(500),
    expiresAt: isoDate,
    invoiceId: uuid.optional(),
});
export const recordUsageSchema = z.object({
    subscriptionId: uuid,
    metricName: z.string().trim().min(1).max(100),
    metricValue: money,
    periodStart: isoDate,
    periodEnd: isoDate,
    metadata: z.record(z.string(), z.unknown()).default({}),
});
export const stripeWebhookSchema = z.object({
    id: z.string().trim().min(1),
    type: z.string().trim().min(1),
    data: z.object({
        object: z.record(z.string(), z.unknown()),
    }),
}).passthrough();
export const createPaymentProfileSchema = billingDeviceContextSchema.extend({
    fullName: z.string().trim().min(1).max(255),
    cardNumber: z.string().trim().regex(/^\d{13,19}$/, "Invalid card number"),
    expiryMonth: z.coerce.number().int().min(1).max(12),
    expiryYear: z.coerce.number().int().min(new Date().getFullYear() % 100).max(99),
    cvc: z.string().trim().regex(/^\d{3,4}$/, "Invalid CVC"),
    addressLine1: z.string().trim().min(1).max(255),
    addressLine2: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),
    isDefault: z.boolean().default(false),
    metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const updatePaymentProfileSchema = billingDeviceContextSchema.extend({
    fullName: z.string().trim().min(1).max(255).optional(),
    addressLine1: z.string().trim().min(1).max(255).optional(),
    addressLine2: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().min(1).max(100).optional(),
    state: z.string().trim().min(1).max(100).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    postalCode: z.string().trim().min(1).max(20).optional(),
    isDefault: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

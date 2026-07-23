import { z } from "zod";
import { CustomerAddressType, CustomerNoteVisibility, CustomerStatus, CustomerType, PricingRuleType } from "../constants/customer.constants";
const uuid = z.string().uuid();
const money = z.string().regex(/^\d+(\.\d{1,4})?$/, "Amount must be a non-negative decimal string");
const isoDate = z.coerce.date();
const nullableText = z.string().trim().max(500).nullable().optional();
export const customerIdParamSchema = z.object({ id: uuid });
export const customerAddressIdParamSchema = z.object({ id: uuid, addressId: uuid });
export const listCustomersSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().trim().uuid().optional(),
    search: z.string().trim().min(1).max(120).optional(),
    sortBy: z.enum(["customerName", "customerCode", "email", "companyName", "status", "createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    status: z.nativeEnum(CustomerStatus).optional(),
    groupId: uuid.optional(),
    customerType: z.nativeEnum(CustomerType).optional(),
    companyName: z.string().trim().max(160).optional(),
    hasPortalAccess: z.coerce.boolean().optional(),
});
export const createCustomerSchema = z.object({
    customerCode: z.string().trim().min(2).max(50),
    customerName: z.string().trim().min(2).max(160),
    customerType: z.nativeEnum(CustomerType).default(CustomerType.Retail),
    companyName: z.string().trim().max(160).nullable().optional(),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().max(40).nullable().optional(),
    taxNumber: z.string().trim().max(80).nullable().optional(),
    customerGroupId: uuid.nullable().optional(),
    paymentTermsId: uuid.nullable().optional(),
    preferredCurrencyCode: z.string().trim().length(3).default("USD"),
    status: z.nativeEnum(CustomerStatus).default(CustomerStatus.Active),
    portalEnabled: z.boolean().default(false),
    metadata: z.record(z.string(), z.unknown()).default({}),
});
export const updateCustomerSchema = createCustomerSchema.partial().strict().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
});
export const addCustomerAddressSchema = z.object({
    addressType: z.nativeEnum(CustomerAddressType),
    contactName: z.string().trim().max(120).nullable().optional(),
    contactPhone: z.string().trim().max(40).nullable().optional(),
    line1: z.string().trim().min(2).max(180),
    line2: z.string().trim().max(180).nullable().optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100).nullable().optional(),
    postalCode: z.string().trim().min(2).max(30),
    country: z.string().trim().min(2).max(2),
    isDefaultBilling: z.boolean().default(false),
    isDefaultShipping: z.boolean().default(false),
});
export const updateCustomerAddressSchema = addCustomerAddressSchema.partial().strict().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
});
export const createCustomerGroupSchema = z.object({
    groupCode: z.string().trim().min(2).max(50),
    groupName: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).nullable().optional(),
    isActive: z.boolean().default(true),
});
export const updateCreditLimitSchema = z.object({
    creditLimit: money.refine((value) => Number(value) >= 0, "Credit limit cannot be negative"),
    currencyCode: z.string().trim().length(3).default("USD"),
    effectiveFrom: isoDate.default(() => new Date()),
    effectiveTo: isoDate.nullable().optional(),
    reason: z.string().trim().min(3).max(500).optional(),
});
export const createPricingRuleSchema = z.object({
    ruleType: z.nativeEnum(PricingRuleType),
    productId: uuid.nullable().optional(),
    productCategoryId: uuid.nullable().optional(),
    minimumQuantity: money.default("1"),
    discountPercent: money.nullable().optional(),
    fixedPrice: money.nullable().optional(),
    currencyCode: z.string().trim().length(3).default("USD"),
    effectiveFrom: isoDate.default(() => new Date()),
    effectiveTo: isoDate.nullable().optional(),
    isActive: z.boolean().default(true),
}).superRefine((value, context) => {
    if (value.ruleType === PricingRuleType.DiscountPercent && !value.discountPercent) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["discountPercent"], message: "Discount percent is required" });
    }
    if (value.ruleType === PricingRuleType.FixedPrice && !value.fixedPrice) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["fixedPrice"], message: "Fixed price is required" });
    }
});
export const addCustomerNoteSchema = z.object({
    note: z.string().trim().min(1).max(4000),
    visibility: z.nativeEnum(CustomerNoteVisibility).default(CustomerNoteVisibility.Internal),
});
export const upsertTaxExemptionSchema = z.object({
    certificateNumber: z.string().trim().min(2).max(120),
    exemptionType: z.string().trim().min(2).max(80),
    issuingRegion: z.string().trim().min(2).max(80),
    expiresAt: isoDate.refine((value) => value.getTime() > Date.now(), "Tax exemption certificate is expired"),
    documentUrl: nullableText,
    isActive: z.boolean().default(true),
});
export const upsertShippingPreferenceSchema = z.object({
    preferredCarrier: nullableText,
    serviceLevel: nullableText,
    deliveryInstructions: nullableText,
    allowPartialShipments: z.boolean().default(true),
    preferredWarehouseId: uuid.nullable().optional(),
});

import { z } from "zod";
import { TaxApprovalStatus, TaxCalculationMethod, TaxCompoundingMode, TaxExemptionStatus, TaxProfileOwnerType, TaxRuleStatus, TaxRuleType, TaxScopeLevel, TaxSourceModule, TAX_DEFAULTS, } from "../../constants/tax.constants";
const uuid = z.string().uuid();
const money = z.string().regex(/^\d+(\.\d{1,4})?$/, "Amount must be decimal string");
const percentage = z.string().regex(/^\d+(\.\d{1,4})?$/, "Rate must be decimal string");
const metadata = z.record(z.string(), z.unknown()).default({});
const code = z.string().trim().min(2).max(80).transform((value) => value.toUpperCase());
export const taxIdParamSchema = z.object({ id: uuid });
export const listTaxRulesSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    status: z.nativeEnum(TaxRuleStatus).optional(),
    jurisdictionCode: code.optional(),
    taxCategory: code.optional(),
    scopeLevel: z.nativeEnum(TaxScopeLevel).optional(),
});
const taxRuleFields = {
    companyId: uuid.optional().nullable(),
    organizationId: uuid.optional().nullable(),
    ruleCode: code,
    ruleName: z.string().trim().min(2).max(160),
    description: z.string().trim().max(1000).optional().nullable(),
    taxType: z.nativeEnum(TaxRuleType),
    calculationMethod: z.nativeEnum(TaxCalculationMethod),
    compoundingMode: z.nativeEnum(TaxCompoundingMode).default(TaxCompoundingMode.Standard),
    ratePercent: percentage.optional().nullable(),
    fixedAmount: money.optional().nullable(),
    currencyCode: z.string().length(3).default(TAX_DEFAULTS.currencyCode).transform((value) => value.toUpperCase()),
    jurisdictionId: uuid.optional().nullable(),
    jurisdictionCode: code.default(TAX_DEFAULTS.defaultJurisdictionCode),
    taxCategory: code.default(TAX_DEFAULTS.generalCategory),
    taxGroupCode: code.optional().nullable(),
    priority: z.number().int().min(1).max(1000).default(100),
    scopeLevel: z.nativeEnum(TaxScopeLevel).default(TaxScopeLevel.Company),
    appliesTo: z.string().trim().min(2).max(80).default("ALL").transform((value) => value.toUpperCase()),
    isRecoverable: z.boolean().default(false),
    requiresApproval: z.boolean().default(true),
    approvalStatus: z.nativeEnum(TaxApprovalStatus).default(TaxApprovalStatus.Draft),
    parentRuleId: uuid.optional().nullable(),
    effectiveFrom: z.coerce.date().default(() => new Date()),
    effectiveTo: z.coerce.date().optional().nullable(),
    status: z.nativeEnum(TaxRuleStatus).default(TaxRuleStatus.Active),
    metadata,
};
const validateTaxRuleShape = (value, ctx) => {
    if (value.taxType === TaxRuleType.Percentage && !value.ratePercent) {
        ctx.addIssue({ code: "custom", path: ["ratePercent"], message: "ratePercent required" });
    }
    if (value.taxType === TaxRuleType.Fixed && !value.fixedAmount) {
        ctx.addIssue({ code: "custom", path: ["fixedAmount"], message: "fixedAmount required" });
    }
};
const normalizeEnumValue = (value) => typeof value === "string" ? value.trim().toUpperCase() : value;
const normalizeOptionalDecimal = (value) => typeof value === "number" ? value.toString() : value;
const normalizeOptionalValue = (value) => typeof value === "string" && value.trim() === "" ? undefined : value;
const normalizeTaxRuleInput = (input) => {
    if (!input || typeof input !== "object" || Array.isArray(input))
        return input;
    const source = input;
    const rawTaxType = normalizeEnumValue(source.taxType);
    const taxType = rawTaxType === TaxRuleType.Percentage || rawTaxType === TaxRuleType.Fixed
        ? rawTaxType
        : source.rate !== undefined || source.ratePercent !== undefined
            ? TaxRuleType.Percentage
            : rawTaxType;
    const rawCalculationMethod = normalizeEnumValue(source.calculationMethod ?? source.calculationType);
    const calculationMethod = rawCalculationMethod === TaxCalculationMethod.Inclusive ||
        rawCalculationMethod === TaxCalculationMethod.Exclusive
        ? rawCalculationMethod
        : source.isInclusive === true
            ? TaxCalculationMethod.Inclusive
            : TaxCalculationMethod.Exclusive;
    return {
        ruleCode: source.ruleCode ?? source.code,
        ruleName: source.ruleName ?? source.name,
        taxType,
        calculationMethod,
        compoundingMode: normalizeEnumValue(source.compoundingMode ?? (source.isCompound === true ? TaxCompoundingMode.Compound : TaxCompoundingMode.Standard)),
        ratePercent: normalizeOptionalDecimal(source.ratePercent ?? source.rate),
        fixedAmount: normalizeOptionalDecimal(source.fixedAmount),
        currencyCode: source.currencyCode,
        jurisdictionCode: source.jurisdictionCode,
        taxCategory: source.taxCategory,
        taxGroupCode: source.taxGroupCode,
        priority: source.priority,
        scopeLevel: normalizeEnumValue(source.scopeLevel),
        appliesTo: source.appliesTo,
        isRecoverable: source.isRecoverable,
        requiresApproval: source.requiresApproval,
        approvalStatus: normalizeEnumValue(source.approvalStatus),
        parentRuleId: source.parentRuleId,
        effectiveFrom: source.effectiveFrom,
        effectiveTo: source.effectiveTo,
        status: normalizeEnumValue(source.status),
        description: source.description,
        companyId: source.companyId,
        organizationId: source.organizationId,
        jurisdictionId: source.jurisdictionId,
        metadata: source.metadata,
    };
};
export const createTaxRuleSchema = z.preprocess(normalizeTaxRuleInput, z.object(taxRuleFields).strict().superRefine(validateTaxRuleShape));
export const updateTaxRuleSchema = z.preprocess(normalizeTaxRuleInput, z.object(taxRuleFields).partial().strict().superRefine(validateTaxRuleShape));
const taxLineSchema = z.object({
    lineId: z.string().trim().min(1).max(120),
    itemId: z.string().trim().max(120).optional(),
    description: z.string().trim().max(300).optional(),
    quantity: money,
    unitAmount: money,
    discountAmount: money.optional(),
    taxCategory: code.optional(),
    taxGroupCode: code.optional(),
    taxRuleIds: z.array(uuid).max(20).optional(),
    taxIncluded: z.boolean().optional(),
    exempt: z.boolean().optional(),
    taxOverrideAmount: money.optional(),
    metadata,
}).strict();
const normalizeTaxLineInput = (input) => {
    if (!input || typeof input !== "object" || Array.isArray(input))
        return input;
    const source = input;
    const taxableAmount = normalizeOptionalDecimal(source.taxableAmount);
    return {
        lineId: source.lineId,
        itemId: source.itemId,
        description: source.description,
        quantity: normalizeOptionalDecimal(source.quantity ?? "1"),
        unitAmount: normalizeOptionalDecimal(source.unitAmount ?? source.unitPrice ?? source.amount ?? taxableAmount),
        discountAmount: normalizeOptionalDecimal(source.discountAmount),
        taxCategory: source.taxCategory,
        taxGroupCode: source.taxGroupCode,
        taxRuleIds: source.taxRuleIds,
        taxIncluded: source.taxIncluded,
        exempt: source.exempt,
        taxOverrideAmount: normalizeOptionalDecimal(source.taxOverrideAmount),
        metadata: source.metadata,
    };
};
const normalizeTaxCalculationInput = (input) => {
    if (!input || typeof input !== "object" || Array.isArray(input))
        return input;
    const source = input;
    const sourceModule = normalizeEnumValue(source.sourceModule ?? source.module ?? TaxSourceModule.Invoice);
    const lines = Array.isArray(source.lines)
        ? source.lines.map(normalizeTaxLineInput)
        : source.taxableAmount !== undefined
            ? [
                normalizeTaxLineInput({
                    lineId: "line-1",
                    taxableAmount: source.taxableAmount,
                    taxCategory: source.taxCategory,
                }),
            ]
            : source.lines;
    return {
        companyId: source.companyId,
        organizationId: source.organizationId,
        sourceModule,
        sourceEntityType: source.sourceEntityType,
        sourceEntityId: source.sourceEntityId,
        transactionDate: normalizeOptionalValue(source.transactionDate ?? source.taxDate),
        currencyCode: normalizeOptionalValue(source.currencyCode) ?? TAX_DEFAULTS.currencyCode,
        jurisdictionCode: source.jurisdictionCode,
        sellerJurisdictionCode: source.sellerJurisdictionCode,
        buyerJurisdictionCode: source.buyerJurisdictionCode,
        customerId: source.customerId,
        supplierId: source.supplierId,
        organizationProfileId: source.organizationProfileId,
        customerProfileId: source.customerProfileId,
        supplierProfileId: source.supplierProfileId,
        lines,
        metadata: source.metadata,
    };
};
export const calculateTaxSchema = z.preprocess(normalizeTaxCalculationInput, z.object({
    companyId: uuid.optional(),
    organizationId: uuid.optional().nullable(),
    sourceModule: z
        .nativeEnum(TaxSourceModule)
        .or(z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()))
        .default(TaxSourceModule.Invoice),
    sourceEntityType: z.string().trim().max(80).optional(),
    sourceEntityId: z.string().trim().max(120).optional(),
    transactionDate: z.coerce.date().optional(),
    currencyCode: z.string().length(3).transform((value) => value.toUpperCase()),
    jurisdictionCode: code.optional(),
    sellerJurisdictionCode: code.optional(),
    buyerJurisdictionCode: code.optional(),
    customerId: uuid.optional(),
    supplierId: uuid.optional(),
    organizationProfileId: uuid.optional(),
    customerProfileId: uuid.optional(),
    supplierProfileId: uuid.optional(),
    lines: z.array(taxLineSchema).min(1).max(500),
    metadata,
}).strict());
export const assignTaxProfileSchema = z.object({
    organizationId: uuid.optional().nullable(),
    ownerType: z.nativeEnum(TaxProfileOwnerType),
    ownerId: uuid,
    taxRegistrationNumber: z.string().trim().max(120).optional().nullable(),
    gstNumber: z.string().trim().max(120).optional().nullable(),
    vatNumber: z.string().trim().max(120).optional().nullable(),
    taxIdentifier: z.string().trim().max(120).optional().nullable(),
    businessTaxCategory: code.optional().nullable(),
    taxCategory: code.default(TAX_DEFAULTS.generalCategory),
    exemptionStatus: z.nativeEnum(TaxExemptionStatus).default(TaxExemptionStatus.None),
    exemptionReason: z.string().trim().max(500).optional().nullable(),
    jurisdictionCode: code.default(TAX_DEFAULTS.defaultJurisdictionCode),
    registrationDetails: metadata,
    metadata,
}).strict();
export const validateTaxProfileSchema = z.object({
    ownerType: z.nativeEnum(TaxProfileOwnerType),
    ownerId: uuid,
}).strict();

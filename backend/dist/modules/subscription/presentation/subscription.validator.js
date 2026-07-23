import { z } from "zod";
export class SubscriptionValidator {
    static planId = z.object({
        id: z.string().uuid(),
    });
    static normalizePlanInput = (input) => {
        if (!input || typeof input !== "object" || Array.isArray(input))
            return input;
        const source = input;
        return {
            ...source,
            monthlyPrice: source.monthlyPrice?.toString(),
            annualPrice: source.annualPrice?.toString(),
        };
    };
    static plan = z.preprocess(SubscriptionValidator.normalizePlanInput, z.object({
        name: z.string().trim().min(2).max(120),
        code: z.string().trim().min(2).max(80).transform((value) => value.toLowerCase()),
        description: z.string().trim().max(1000).optional().nullable(),
        monthlyPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
        annualPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
        currencyCode: z.string().trim().length(3).transform((value) => value.toUpperCase()),
        monthlyDurationMonths: z.number().int().min(1).max(120).default(1),
        annualDurationMonths: z.number().int().min(1).max(120).default(12),
        maxUsers: z.number().int().min(0).default(0),
        maxWarehouses: z.number().int().min(0).default(0),
        maxCompanies: z.number().int().min(0).default(0),
        maxApiRequestsPerMonth: z.number().int().min(0).default(0),
        maxStorageGb: z.number().int().min(0).default(0),
        supportsApi: z.boolean().default(true),
        supportsSso: z.boolean().default(false),
        supportsCustomRoles: z.boolean().default(true),
        supportsMultiEntity: z.boolean().default(false),
        supportsAdvancedReporting: z.boolean().default(false),
        supportsSandbox: z.boolean().default(false),
    }).strip());
    static updatePlan = z.preprocess(SubscriptionValidator.normalizePlanInput, z.object({
        name: z.string().trim().min(2).max(120).optional(),
        code: z.string().trim().min(2).max(80).transform((value) => value.toLowerCase()).optional(),
        description: z.string().trim().max(1000).optional().nullable(),
        monthlyPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        annualPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        currencyCode: z.string().trim().length(3).transform((value) => value.toUpperCase()).optional(),
        monthlyDurationMonths: z.number().int().min(1).max(120).optional(),
        annualDurationMonths: z.number().int().min(1).max(120).optional(),
        maxUsers: z.number().int().min(0).optional(),
        maxWarehouses: z.number().int().min(0).optional(),
        maxCompanies: z.number().int().min(0).optional(),
        maxApiRequestsPerMonth: z.number().int().min(0).optional(),
        maxStorageGb: z.number().int().min(0).optional(),
        supportsApi: z.boolean().optional(),
        supportsSso: z.boolean().optional(),
        supportsCustomRoles: z.boolean().optional(),
        supportsMultiEntity: z.boolean().optional(),
        supportsAdvancedReporting: z.boolean().optional(),
        supportsSandbox: z.boolean().optional(),
    }).strip());
    static create = z.object({
        subscriptionPlanId: z.string().uuid(),
        billingCycle: z.enum(["monthly", "annual", "trial"]),
        trialDays: z.number().int().positive().max(90).optional(),
    });
    static cancel = z.object({ reason: z.string().optional() });
    static usage = z.object({ metricName: z.string().min(2), metricValue: z.number().nonnegative() });
}

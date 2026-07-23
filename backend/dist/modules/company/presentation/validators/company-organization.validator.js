import { z } from "zod";
export class CompanyValidator {
    static createTenant = z.object({
        companyName: z.string().trim().min(2),
        legalBusinessName: z.string().trim().min(2).optional(),
        industry: z.string().trim().min(2),
        companySize: z.string().trim().min(2),
        website: z.string().trim().url().optional(),
        businessType: z.string().trim().min(2),
        currencyCode: z.string().trim().length(3).transform((value) => value.toUpperCase()),
        taxNumber: z.string().trim().min(2).optional(),
        country: z.string().trim().min(2),
        stateProvince: z.string().trim().min(2),
        city: z.string().trim().min(2),
        postalCode: z.string().trim().min(2),
        timezone: z.string().trim().min(2),
    });
    static onboarding = z.object({
        status: z.string().trim().min(2),
    });
    static createOrganization = z.object({
        name: z.string().min(2),
        legalName: z.string().optional(),
        organizationCode: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
    });
    static tenantSettings = z.object({
        timezone: z.string().optional(),
        defaultCurrencyCode: z.string().length(3).optional(),
        themeColor: z.string().optional(),
        enableMfa: z.boolean().optional(),
        enableSso: z.boolean().optional(),
        enableApiAccess: z.boolean().optional(),
        enableCustomRoles: z.boolean().optional(),
        enableMultiCompany: z.boolean().optional(),
        enableMultiWarehouse: z.boolean().optional(),
    });
    static organizationSettings = z.object({
        legalName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        logoUrl: z.string().url().optional(),
    });
    static scopedAccess = z.object({
        userId: z.string().uuid(),
        roleId: z.string().uuid(),
        companyId: z.string().uuid().optional(),
        branchId: z.string().uuid().optional(),
        warehouseId: z.string().uuid().optional(),
    });
    static linkSubscription = z.object({
        subscriptionPlanId: z.string().uuid(),
    });
}

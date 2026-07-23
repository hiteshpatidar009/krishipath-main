import { z } from "zod";
export class SettingsValidator {
    static update = z.object({
        timezone: z.string().optional(),
        defaultCurrencyCode: z.string().length(3).optional(),
        dateFormat: z.string().optional(),
        timeFormat: z.string().optional(),
        languageCode: z.string().optional(),
        logoUrl: z.string().url().optional(),
        faviconUrl: z.string().url().optional(),
        themeColor: z.string().optional(),
        enableMfa: z.boolean().optional(),
        enableSso: z.boolean().optional(),
        enableApiAccess: z.boolean().optional(),
        enableCustomRoles: z.boolean().optional(),
        enableMultiCompany: z.boolean().optional(),
        enableMultiWarehouse: z.boolean().optional(),
        defaultSessionTimeoutMinutes: z.number().int().positive().optional(),
        passwordExpiryDays: z.number().int().positive().optional(),
        maxFailedLoginAttempts: z.number().int().positive().optional(),
        lockoutDurationMinutes: z.number().int().positive().optional(),
    });
    static feature = z.object({
        featureKey: z.string().min(2),
        featureName: z.string().min(2),
        isEnabled: z.boolean(),
    });
}

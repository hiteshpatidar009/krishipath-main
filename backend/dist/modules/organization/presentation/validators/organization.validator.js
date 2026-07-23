import { z } from "zod";
export class OrganizationValidator {
    static create = z.object({
        name: z.string().min(2),
        organizationCode: z.string().min(2).optional(),
        legalName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
    });
    static update = z.object({
        name: z.string().min(2).optional(),
        legalName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        logoUrl: z.string().url().optional(),
    });
    static invite = z.object({
        email: z.string().email(),
    });
    static assignRole = z.object({
        userId: z.string().uuid(),
        roleId: z.string().uuid(),
    });
    static linkWarehouse = z.object({
        warehouseId: z.string().uuid(),
    });
}

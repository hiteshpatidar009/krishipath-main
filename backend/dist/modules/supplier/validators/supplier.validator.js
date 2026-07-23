import { z } from "zod";
export class CreateSupplierValidator {
    static schema = z.object({
        supplierCode: z.string().trim().min(2).max(50),
        supplierName: z.string().trim().min(2).max(200),
        supplierType: z.string().trim().min(1).max(50),
        email: z.string().trim().email(),
        phone: z.string().trim().min(5).max(20),
        website: z.string().trim().optional(),
        taxNumber: z.string().trim().optional(),
        paymentTerms: z.string().trim().optional(),
        creditLimit: z.number().positive().optional(),
    });
    static validate(input) {
        CreateSupplierValidator.schema.parse(input);
    }
    static parse(input) {
        return CreateSupplierValidator.schema.parse(input);
    }
}
export class UpdateSupplierValidator {
    static schema = z.object({
        supplierName: z.string().trim().min(2).max(200).optional(),
        supplierType: z.string().trim().min(1).max(50).optional(),
        email: z.string().trim().email().optional(),
        phone: z.string().trim().min(5).max(20).optional(),
        website: z.string().trim().optional(),
        taxNumber: z.string().trim().optional(),
        paymentTerms: z.string().trim().optional(),
        creditLimit: z.number().positive().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "BLACKLISTED"]).optional(),
    });
    static validate(input) {
        UpdateSupplierValidator.schema.parse(input);
    }
    static parse(input) {
        return UpdateSupplierValidator.schema.parse(input);
    }
}

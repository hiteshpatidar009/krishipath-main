import { z } from "zod";
export class CreateSupplierContactValidator {
    static schema = z.object({
        contactName: z.string().trim().min(2).max(100),
        designation: z.string().trim().optional(),
        email: z.string().trim().email(),
        phone: z.string().trim().min(5).max(20),
        isPrimary: z.boolean(),
    });
    static validate(input) {
        CreateSupplierContactValidator.schema.parse(input);
    }
    static parse(input) {
        return CreateSupplierContactValidator.schema.parse(input);
    }
}
export class UpdateSupplierContactValidator {
    static schema = z.object({
        contactName: z.string().trim().min(2).max(100).optional(),
        designation: z.string().trim().optional(),
        email: z.string().trim().email().optional(),
        phone: z.string().trim().min(5).max(20).optional(),
        isPrimary: z.boolean().optional(),
    });
    static validate(input) {
        UpdateSupplierContactValidator.schema.parse(input);
    }
    static parse(input) {
        return UpdateSupplierContactValidator.schema.parse(input);
    }
}

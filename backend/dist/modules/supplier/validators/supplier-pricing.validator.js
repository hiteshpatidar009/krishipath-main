import { z } from "zod";
export class CreateSupplierPricingValidator {
    static schema = z.object({
        productId: z.string().uuid(),
        minimumQuantity: z.number().positive(),
        unitCost: z.number().positive(),
        currencyCode: z.string().trim().length(3),
        leadTimeDays: z.number().nonnegative(),
        effectiveFrom: z.string().date(),
        effectiveTo: z.string().date().optional(),
    });
    static validate(input) {
        CreateSupplierPricingValidator.schema.parse(input);
    }
    static parse(input) {
        return CreateSupplierPricingValidator.schema.parse(input);
    }
}
export class UpdateSupplierPricingValidator {
    static schema = z.object({
        minimumQuantity: z.number().positive().optional(),
        unitCost: z.number().positive().optional(),
        currencyCode: z.string().trim().length(3).optional(),
        leadTimeDays: z.number().nonnegative().optional(),
        effectiveFrom: z.string().date().optional(),
        effectiveTo: z.string().date().optional(),
    });
    static validate(input) {
        UpdateSupplierPricingValidator.schema.parse(input);
    }
    static parse(input) {
        return UpdateSupplierPricingValidator.schema.parse(input);
    }
}

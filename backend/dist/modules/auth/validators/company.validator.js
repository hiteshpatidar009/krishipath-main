import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class CompanyValidator extends BaseValidator {
    static schema = z.object({
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
    validate(input) {
        CompanyValidator.schema.parse(input);
    }
    parse(input) {
        return CompanyValidator.schema.parse(input);
    }
}

import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaAppValidator extends BaseValidator {
    static schema = z.object({
        secret: z.string().trim().min(16).optional(),
        setupToken: z.string().trim().uuid().optional(),
        code: z.string().trim().regex(/^\d{6}$/),
    });
    validate(input) {
        MfaAppValidator.schema.parse(input);
    }
    parse(input) {
        return MfaAppValidator.schema.parse(input);
    }
}

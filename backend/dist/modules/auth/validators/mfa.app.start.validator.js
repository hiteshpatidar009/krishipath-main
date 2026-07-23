import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaAppStartValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
        password: z.string().min(8).optional(),
        setupToken: z.string().trim().uuid().optional(),
    });
    validate(input) {
        MfaAppStartValidator.schema.parse(input);
    }
    parse(input) {
        return MfaAppStartValidator.schema.parse(input);
    }
}

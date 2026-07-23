import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaAppVerifySetupValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
        password: z.string().min(8).optional(),
        setupToken: z.string().trim().uuid().optional(),
        secret: z.string().trim().min(16).optional(),
        code: z.string().trim().regex(/^\d{6}$/),
    });
    validate(input) {
        MfaAppVerifySetupValidator.schema.parse(input);
    }
    parse(input) {
        return MfaAppVerifySetupValidator.schema.parse(input);
    }
}

import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class SignupPasswordSetValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
        setupToken: z.string().trim().uuid(),
        password: z.string().min(8),
    });
    validate(input) {
        SignupPasswordSetValidator.schema.parse(input);
    }
    parse(input) {
        return SignupPasswordSetValidator.schema.parse(input);
    }
}

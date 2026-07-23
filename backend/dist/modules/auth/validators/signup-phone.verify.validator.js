import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class SignupPhoneVerifyValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
        challengeId: z.string().uuid(),
        code: z.string().trim().regex(/^\d{6}$/),
    });
    validate(input) {
        SignupPhoneVerifyValidator.schema.parse(input);
    }
    parse(input) {
        return SignupPhoneVerifyValidator.schema.parse(input);
    }
}

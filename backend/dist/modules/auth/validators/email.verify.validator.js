import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class EmailVerifyValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
        challengeId: z.string().uuid(),
        code: z.string().trim().regex(/^\d{6}$/),
    });
    validate(input) {
        EmailVerifyValidator.schema.parse(input);
    }
    parse(input) {
        return EmailVerifyValidator.schema.parse(input);
    }
}

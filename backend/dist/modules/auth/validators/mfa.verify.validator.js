import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaVerifyValidator extends BaseValidator {
    static schema = z.object({
        challengeId: z.string().uuid(),
        code: z.string().trim().regex(/^\d{6}$/),
    });
    validate(input) {
        MfaVerifyValidator.schema.parse(input);
    }
    parse(input) {
        return MfaVerifyValidator.schema.parse(input);
    }
}

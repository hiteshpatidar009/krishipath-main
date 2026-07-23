import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class SignupPhoneStartValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
        phone: z.string().trim().min(6).optional(),
        channel: z.enum(["sms", "whatsapp"]).optional().default("sms"),
    });
    validate(input) {
        SignupPhoneStartValidator.schema.parse(input);
    }
    parse(input) {
        return SignupPhoneStartValidator.schema.parse(input);
    }
}

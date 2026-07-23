import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaPhoneValidator extends BaseValidator {
    static schema = z.object({
        phone: z.string().trim().min(6),
        channel: z.enum(["sms", "whatsapp"]).optional().default("sms"),
    });
    validate(input) {
        MfaPhoneValidator.schema.parse(input);
    }
    parse(input) {
        return MfaPhoneValidator.schema.parse(input);
    }
}

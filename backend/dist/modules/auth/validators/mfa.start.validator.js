import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
const mfaFlow = z.enum(["signup", "login", "account_setup"]);
const mfaFactorType = z.enum([
    "email_otp",
    "phone_sms",
    "phone_whatsapp",
    "authenticator_app",
]);
export class MfaStartValidator extends BaseValidator {
    static schema = z.object({
        flow: mfaFlow.optional(),
        type: mfaFactorType,
        email: z.string().trim().email().optional(),
        phone: z.string().trim().min(6).optional(),
        password: z.string().min(8).optional(),
        setupToken: z.string().trim().uuid().optional(),
    });
    validate(input) {
        MfaStartValidator.schema.parse(input);
    }
    parse(input) {
        return MfaStartValidator.schema.parse(input);
    }
}

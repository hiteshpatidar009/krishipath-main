import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
const mfaFlow = z.enum(["signup", "login", "account_setup"]);
const mfaFactorType = z.enum([
    "email_otp",
    "phone_sms",
    "phone_whatsapp",
    "authenticator_app",
]);
export class MfaUnifiedVerifyValidator extends BaseValidator {
    static schema = z.object({
        flow: mfaFlow.optional(),
        type: mfaFactorType,
        code: z.string().trim().regex(/^(\d{6}|[A-Z0-9]{8})$/i),
        challengeId: z.string().trim().uuid().optional(),
        email: z.string().trim().email().optional(),
        password: z.string().min(8).optional(),
        phone: z.string().trim().min(6).optional(),
        setupToken: z.string().trim().uuid().optional(),
        secret: z.string().trim().min(16).optional(),
        companyId: z.string().trim().uuid().optional(),
        deviceId: z.string().trim().min(4).optional(),
        deviceName: z.string().trim().min(1).optional(),
        deviceType: z.string().trim().min(1).optional(),
        operatingSystem: z.string().trim().min(1).optional(),
        browser: z.string().trim().min(1).optional(),
        mfaTrustToken: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().min(40).optional()),
    });
    validate(input) {
        MfaUnifiedVerifyValidator.schema.parse(input);
    }
    parse(input) {
        return MfaUnifiedVerifyValidator.schema.parse(input);
    }
}

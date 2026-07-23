import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
import { captchaPayloadFields } from "./captcha-payload.schema";
export class LoginStartValidator extends BaseValidator {
    static schema = z
        .object({
        email: z.string().trim().email().optional(),
        phone: z.string().trim().min(6).optional(),
        password: z.string().min(8).optional(),
        companyId: z.string().uuid().optional(),
        isRoot: z.boolean().optional().default(false),
        ...captchaPayloadFields(),
        method: z.enum(["email_password", "email_otp", "phone_otp"]).optional(),
        otpChannel: z.enum(["sms", "whatsapp"]).optional().default("sms"),
        deviceId: z.string().trim().min(4).optional(),
        deviceName: z.string().trim().min(1).optional(),
        deviceType: z.string().trim().min(1).optional(),
        operatingSystem: z.string().trim().min(1).optional(),
        browser: z.string().trim().min(1).optional(),
        mfaTrustToken: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().min(40).optional()),
    })
        .superRefine((value, ctx) => {
        const method = value.method ?? "email_password";
        if (method === "phone_otp") {
            if (!value.phone) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["phone"],
                    message: "Phone is required for phone OTP login",
                });
            }
            return;
        }
        if (!value.email) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["email"],
                message: "Email is required",
            });
        }
        if (method === "email_password" && !value.password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: "Password is required",
            });
        }
    });
    validate(input) {
        LoginStartValidator.schema.parse(input);
    }
    parse(input) {
        return LoginStartValidator.schema.parse(input);
    }
}

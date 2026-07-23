import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class LoginValidator extends BaseValidator {
    static schema = z
        .object({
        email: z.string().trim().email(),
        password: z.string().min(8),
        method: z.string().optional(),
        isRoot: z.boolean().optional(),
        deviceId: z.string().optional(),
        deviceName: z.string().optional(),
        deviceType: z.string().optional(),
        operatingSystem: z.string().optional(),
        browser: z.string().optional(),
        captchaToken: z.string().optional(),
        captchaCode: z.string().optional(),
    })
        .transform((data) => ({
        email: data.email,
        password: data.password,
    }));
    validate(input) {
        LoginValidator.schema.parse(input);
    }
    parse(input) {
        return LoginValidator.schema.parse(input);
    }
}

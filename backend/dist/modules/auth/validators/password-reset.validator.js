import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class PasswordResetStartValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
    });
    validate(input) {
        PasswordResetStartValidator.schema.parse(input);
    }
    parse(input) {
        return PasswordResetStartValidator.schema.parse(input);
    }
}
export class PasswordResetConfirmValidator extends BaseValidator {
    static schema = z.object({
        token: z.string().trim().length(6, "OTP must be 6 digits"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
    });
    validate(input) {
        PasswordResetConfirmValidator.schema.parse(input);
    }
    parse(input) {
        return PasswordResetConfirmValidator.schema.parse(input);
    }
}
export class PasswordResetValidateValidator extends BaseValidator {
    static schema = z.object({
        token: z.string().trim().length(6, "OTP must be 6 digits"),
    });
    validate(input) {
        PasswordResetValidateValidator.schema.parse(input);
    }
    parse(input) {
        return PasswordResetValidateValidator.schema.parse(input);
    }
}

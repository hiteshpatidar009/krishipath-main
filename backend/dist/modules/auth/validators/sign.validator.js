import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
import { captchaPayloadFields } from "./captcha-payload.schema";
export class SignValidator extends BaseValidator {
    static schema = z.object({
        firstName: z.string().trim().min(2),
        lastName: z.string().trim().min(1).optional(),
        email: z.string().trim().email(),
        password: z.string().min(8),
        acceptedTerms: z.literal(true),
        phone: z.string().trim().min(6).optional(),
        ...captchaPayloadFields(),
    });
    validate(input) {
        SignValidator.schema.parse(input);
    }
    parse(input) {
        return SignValidator.schema.parse(input);
    }
}

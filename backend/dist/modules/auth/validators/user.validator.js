import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class UserValidator extends BaseValidator {
    static schema = z.object({
        firstName: z.string().trim().min(2),
        lastName: z.string().trim().min(1).optional(),
        email: z.string().trim().email(),
        password: z.string().min(8),
        phone: z.string().trim().min(6).optional(),
        roleIds: z.array(z.string().uuid()).min(1),
    });
    validate(input) {
        UserValidator.schema.parse(input);
    }
    parse(input) {
        return UserValidator.schema.parse(input);
    }
}

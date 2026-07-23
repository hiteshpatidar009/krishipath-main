import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class RoleValidator extends BaseValidator {
    static schema = z.object({
        name: z.string().trim().min(2),
        description: z.string().trim().optional(),
        permissionIds: z.array(z.string().uuid()).min(1),
        color: z.string().trim().optional(),
    });
    validate(input) {
        RoleValidator.schema.parse(input);
    }
    parse(input) {
        return RoleValidator.schema.parse(input);
    }
}

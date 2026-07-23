import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class RoleIdParamValidator extends BaseValidator {
    static schema = z.object({
        roleId: z.string().uuid(),
    });
    validate(input) {
        RoleIdParamValidator.schema.parse(input);
    }
}

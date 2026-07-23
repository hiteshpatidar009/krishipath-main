import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class UpdateRoleValidator extends BaseValidator {
    static schema = z
        .object({
        name: z.string().trim().min(2).optional(),
        description: z.string().trim().min(1).optional(),
        color: z.string().trim().min(1).optional(),
        permissionIds: z.array(z.string().uuid()).min(1).optional(),
        permissionKeys: z.array(z.string().trim().min(1)).min(1).optional(),
        assignAll: z.boolean().optional(),
        parentRoleId: z.string().uuid().nullable().optional(),
    })
        .refine((input) => input.name !== undefined ||
        input.description !== undefined ||
        input.color !== undefined ||
        input.permissionIds !== undefined ||
        input.permissionKeys !== undefined ||
        input.assignAll !== undefined ||
        input.parentRoleId !== undefined, {
        message: "At least one field must be provided",
    });
    validate(input) {
        UpdateRoleValidator.schema.parse(input);
    }
    parse(input) {
        return UpdateRoleValidator.schema.parse(input);
    }
}

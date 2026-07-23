import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class CreateRoleValidator extends BaseValidator {
    static schema = z
        .object({
        name: z.string().trim().min(2),
        description: z.string().trim().min(1).optional(),
        color: z.string().trim().min(1).optional(),
        permissionIds: z.array(z.string().uuid()).min(1).optional(),
        permissionKeys: z.array(z.string().trim().min(1)).min(1).optional(),
        assignAll: z.boolean().optional(),
        parentRoleId: z.string().uuid().optional(),
    })
        .refine((input) => Boolean(input.permissionIds?.length) ||
        Boolean(input.permissionKeys?.length) ||
        input.assignAll === true, {
        message: "At least one permissionIds, permissionKeys, or assignAll value is required",
        path: ["permissionIds"],
    });
    validate(input) {
        CreateRoleValidator.schema.parse(input);
    }
    parse(input) {
        return CreateRoleValidator.schema.parse(input);
    }
}

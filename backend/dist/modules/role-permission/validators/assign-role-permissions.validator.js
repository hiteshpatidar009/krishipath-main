import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class AssignRolePermissionsValidator extends BaseValidator {
    static schema = z
        .preprocess((input) => {
        if (!input || typeof input !== "object") {
            return input;
        }
        const payload = input;
        return {
            ...payload,
            permissionIds: payload.permissionIds ?? payload.permissionsIds,
        };
    }, z.object({
        permissionIds: z.array(z.string().uuid()).min(1).optional(),
        permissionKeys: z.array(z.string().trim().min(1)).min(1).optional(),
        assignAll: z.boolean().optional(),
    }))
        .refine((input) => Boolean(input.permissionIds?.length) ||
        Boolean(input.permissionKeys?.length) ||
        input.assignAll === true, {
        message: "At least one permissionIds, permissionKeys, or assignAll value is required",
        path: ["permissionIds"],
    });
    validate(input) {
        AssignRolePermissionsValidator.schema.parse(input);
    }
    parse(input) {
        return AssignRolePermissionsValidator.schema.parse(input);
    }
}

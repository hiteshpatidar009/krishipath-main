import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { AssignRolePermissionsDto } from "../dto/assign-role-permissions.dto";

export class AssignRolePermissionsValidator extends BaseValidator<unknown> {
  public static readonly schema = z
    .preprocess(
      (input) => {
        if (!input || typeof input !== "object") {
          return input;
        }

        const payload = input as Record<string, unknown>;
        return {
          ...payload,
          permissionIds: payload.permissionIds ?? payload.permissionsIds,
        };
      },
    z.object({
      permissionIds: z.array(z.string().uuid()).min(1).optional(),
      permissionKeys: z.array(z.string().trim().min(1)).min(1).optional(),
      assignAll: z.boolean().optional(),
    }),
  )
    .refine(
      (input) =>
        Boolean(input.permissionIds?.length) ||
        Boolean(input.permissionKeys?.length) ||
        input.assignAll === true,
      {
        message:
          "At least one permissionIds, permissionKeys, or assignAll value is required",
        path: ["permissionIds"],
      },
    );

  public validate(input: unknown): void {
    AssignRolePermissionsValidator.schema.parse(input);
  }

  public parse(input: unknown): AssignRolePermissionsDto {
    return AssignRolePermissionsValidator.schema.parse(input);
  }
}

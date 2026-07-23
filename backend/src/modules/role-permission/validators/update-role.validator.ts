import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { UpdateRoleDto } from "../dto/update-role.dto";

export class UpdateRoleValidator extends BaseValidator<unknown> {
  public static readonly schema = z
    .object({
      name: z.string().trim().min(2).optional(),
      description: z.string().trim().min(1).optional(),
      color: z.string().trim().min(1).optional(),
      permissionIds: z.array(z.string().uuid()).min(1).optional(),
      permissionKeys: z.array(z.string().trim().min(1)).min(1).optional(),
      assignAll: z.boolean().optional(),
      parentRoleId: z.string().uuid().nullable().optional(),
    })
    .refine(
      (input) =>
        input.name !== undefined ||
        input.description !== undefined ||
        input.color !== undefined ||
        input.permissionIds !== undefined ||
        input.permissionKeys !== undefined ||
        input.assignAll !== undefined ||
        input.parentRoleId !== undefined,
      {
        message: "At least one field must be provided",
      },
    );

  public validate(input: unknown): void {
    UpdateRoleValidator.schema.parse(input);
  }

  public parse(input: unknown): UpdateRoleDto {
    return UpdateRoleValidator.schema.parse(input);
  }
}


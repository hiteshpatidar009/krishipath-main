import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { RoleDto } from "../dto/role.dto";

export class RoleValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    permissionIds: z.array(z.string().uuid()).min(1),
    color: z.string().trim().optional(),
  });

  public validate(input: unknown): void {
    RoleValidator.schema.parse(input);
  }

  public parse(input: unknown): RoleDto {
    return RoleValidator.schema.parse(input);
  }
}

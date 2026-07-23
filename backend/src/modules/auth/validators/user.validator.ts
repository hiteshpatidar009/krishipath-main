import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { UserDto } from "../dto/user.dto";

export class UserValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(1).optional(),
    email: z.string().trim().email(),
    password: z.string().min(8),
    phone: z.string().trim().min(6).optional(),
    roleIds: z.array(z.string().uuid()).min(1),
  });

  public validate(input: unknown): void {
    UserValidator.schema.parse(input);
  }

  public parse(input: unknown): UserDto {
    return UserValidator.schema.parse(input);
  }
}

import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";

export class RoleIdParamValidator extends BaseValidator<unknown> {
  public static readonly schema = z.object({
    roleId: z.string().uuid(),
  });

  public validate(input: unknown): void {
    RoleIdParamValidator.schema.parse(input);
  }
}

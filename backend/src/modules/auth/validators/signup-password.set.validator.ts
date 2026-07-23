import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { SignupPasswordSetDto } from "../dto/signup-password.set.dto";

export class SignupPasswordSetValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
    setupToken: z.string().trim().uuid(),
    password: z.string().min(8),
  });

  public validate(input: unknown): void {
    SignupPasswordSetValidator.schema.parse(input);
  }

  public parse(input: unknown): SignupPasswordSetDto {
    return SignupPasswordSetValidator.schema.parse(input);
  }
}

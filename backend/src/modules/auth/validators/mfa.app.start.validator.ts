import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaAppStartDto } from "../dto/mfa.app.start.dto";

export class MfaAppStartValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).optional(),
    setupToken: z.string().trim().uuid().optional(),
  });

  public validate(input: unknown): void {
    MfaAppStartValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaAppStartDto {
    return MfaAppStartValidator.schema.parse(input);
  }
}

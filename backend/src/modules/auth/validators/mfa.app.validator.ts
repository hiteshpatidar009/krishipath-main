import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaAppVerifyDto } from "../dto/mfa.app.dto";

export class MfaAppValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    secret: z.string().trim().min(16).optional(),
    setupToken: z.string().trim().uuid().optional(),
    code: z.string().trim().regex(/^\d{6}$/),
  });

  public validate(input: unknown): void {
    MfaAppValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaAppVerifyDto {
    return MfaAppValidator.schema.parse(input);
  }
}

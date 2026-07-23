import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaAppVerifySetupDto } from "../dto/mfa.app.verify-setup.dto";

export class MfaAppVerifySetupValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).optional(),
    setupToken: z.string().trim().uuid().optional(),
    secret: z.string().trim().min(16).optional(),
    code: z.string().trim().regex(/^\d{6}$/),
  });

  public validate(input: unknown): void {
    MfaAppVerifySetupValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaAppVerifySetupDto {
    return MfaAppVerifySetupValidator.schema.parse(input);
  }
}

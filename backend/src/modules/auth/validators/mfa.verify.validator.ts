import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaVerifyDto } from "../dto/mfa.verify.dto";

export class MfaVerifyValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    challengeId: z.string().uuid(),
    code: z.string().trim().regex(/^\d{6}$/),
  });

  public validate(input: unknown): void {
    MfaVerifyValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaVerifyDto {
    return MfaVerifyValidator.schema.parse(input);
  }
}

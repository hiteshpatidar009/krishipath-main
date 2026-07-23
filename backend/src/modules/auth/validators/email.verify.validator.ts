import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { EmailVerifyDto } from "../dto/email.verify.dto";

export class EmailVerifyValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
    challengeId: z.string().uuid(),
    code: z.string().trim().regex(/^\d{6}$/),
  });

  public validate(input: unknown): void {
    EmailVerifyValidator.schema.parse(input);
  }

  public parse(input: unknown): EmailVerifyDto {
    return EmailVerifyValidator.schema.parse(input);
  }
}

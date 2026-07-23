import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { SignupPhoneVerifyDto } from "../dto/signup-phone.verify.dto";

export class SignupPhoneVerifyValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
    challengeId: z.string().uuid(),
    code: z.string().trim().regex(/^\d{6}$/),
  });

  public validate(input: unknown): void {
    SignupPhoneVerifyValidator.schema.parse(input);
  }

  public parse(input: unknown): SignupPhoneVerifyDto {
    return SignupPhoneVerifyValidator.schema.parse(input);
  }
}

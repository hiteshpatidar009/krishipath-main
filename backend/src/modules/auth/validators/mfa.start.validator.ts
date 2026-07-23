import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaStartDto } from "../dto/mfa.start.dto";

const mfaFlow = z.enum(["signup", "login", "account_setup"]);
const mfaFactorType = z.enum([
  "email_otp",
  "phone_sms",
  "phone_whatsapp",
  "authenticator_app",
]);

export class MfaStartValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    flow: mfaFlow.optional(),
    type: mfaFactorType,
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(6).optional(),
    password: z.string().min(8).optional(),
    setupToken: z.string().trim().uuid().optional(),
  });

  public validate(input: unknown): void {
    MfaStartValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaStartDto {
    return MfaStartValidator.schema.parse(input);
  }
}

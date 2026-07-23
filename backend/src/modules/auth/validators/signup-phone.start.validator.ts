import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { SignupPhoneStartDto } from "../dto/signup-phone.start.dto";

export class SignupPhoneStartValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
    phone: z.string().trim().min(6).optional(),
    channel: z.enum(["sms", "whatsapp"]).optional().default("sms"),
  });

  public validate(input: unknown): void {
    SignupPhoneStartValidator.schema.parse(input);
  }

  public parse(input: unknown): SignupPhoneStartDto {
    return SignupPhoneStartValidator.schema.parse(input);
  }
}

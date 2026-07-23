import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaPhoneDto } from "../dto/mfa.phone.dto";

export class MfaPhoneValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    phone: z.string().trim().min(6),
    channel: z.enum(["sms", "whatsapp"]).optional().default("sms"),
  });

  public validate(input: unknown): void {
    MfaPhoneValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaPhoneDto {
    return MfaPhoneValidator.schema.parse(input);
  }
}

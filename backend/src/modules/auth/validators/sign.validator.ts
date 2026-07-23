import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { SignDto } from "../dto/sign.dto";
import { captchaPayloadFields } from "./captcha-payload.schema";

export class SignValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(1).optional(),
    email: z.string().trim().email(),
    password: z.string().min(8),
    acceptedTerms: z.literal(true),
    phone: z.string().trim().min(6).optional(),
    ...captchaPayloadFields(),
  });

  public validate(input: unknown): void {
    SignValidator.schema.parse(input);
  }

  public parse(input: unknown): SignDto {
    return SignValidator.schema.parse(input);
  }
}

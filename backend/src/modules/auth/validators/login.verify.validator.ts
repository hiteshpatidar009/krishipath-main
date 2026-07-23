import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { LoginVerifyDto } from "../dto/login.verify.dto";

export class LoginVerifyValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    challengeId: z.string().uuid(),
    method: z.enum(["email_otp", "phone_otp", "auth_app_otp"]),
    code: z.string().trim().regex(/^(\d{6}|[A-Z0-9]{8})$/i),
    companyId: z.string().uuid().optional(),
    deviceId: z.string().trim().min(4).optional(),
    deviceName: z.string().trim().min(1).optional(),
    deviceType: z.string().trim().min(1).optional(),
    operatingSystem: z.string().trim().min(1).optional(),
    browser: z.string().trim().min(1).optional(),
    mfaTrustToken: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.string().trim().min(40).optional(),
    ),
  });

  public validate(input: unknown): void {
    LoginVerifyValidator.schema.parse(input);
  }

  public parse(input: unknown): LoginVerifyDto {
    return LoginVerifyValidator.schema.parse(input);
  }
}

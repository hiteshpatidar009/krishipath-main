import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
import { LoginDto } from "../dto/login.dto";

export class LoginValidator extends BaseValidator<unknown> {
  private static readonly schema = z
    .object({
      email: z.string().trim().email(),
      password: z.string().min(8),
      method: z.string().optional(),
      isRoot: z.boolean().optional(),
      deviceId: z.string().optional(),
      deviceName: z.string().optional(),
      deviceType: z.string().optional(),
      operatingSystem: z.string().optional(),
      browser: z.string().optional(),
      captchaToken: z.string().optional(),
      captchaCode: z.string().optional(),
    })
    .transform((data) => ({
      email: data.email,
      password: data.password,
    }));

  public validate(input: unknown): void {
    LoginValidator.schema.parse(input);
  }

  public parse(input: unknown): LoginDto {
    return LoginValidator.schema.parse(input);
  }
}

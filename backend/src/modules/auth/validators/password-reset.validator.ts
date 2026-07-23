import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import {
  PasswordResetConfirmDto,
  PasswordResetStartDto,
  PasswordResetValidateDto,
} from "../dto/password-reset.dto";

export class PasswordResetStartValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
  });

  public validate(input: unknown): void {
    PasswordResetStartValidator.schema.parse(input);
  }

  public parse(input: unknown): PasswordResetStartDto {
    return PasswordResetStartValidator.schema.parse(input);
  }
}

export class PasswordResetConfirmValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    token: z.string().trim().length(6, "OTP must be 6 digits"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

  public validate(input: unknown): void {
    PasswordResetConfirmValidator.schema.parse(input);
  }

  public parse(input: unknown): PasswordResetConfirmDto {
    return PasswordResetConfirmValidator.schema.parse(input);
  }
}

export class PasswordResetValidateValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    token: z.string().trim().length(6, "OTP must be 6 digits"),
  });

  public validate(input: unknown): void {
    PasswordResetValidateValidator.schema.parse(input);
  }

  public parse(input: unknown): PasswordResetValidateDto {
    return PasswordResetValidateValidator.schema.parse(input);
  }
}

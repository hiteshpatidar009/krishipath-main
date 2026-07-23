import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaTrustSessionRevokeAllDto } from "../dto/mfa-trust-session.dto";

export class MfaTrustSessionRevokeAllValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    userId: z.string().uuid().optional(),
  });

  public validate(input: unknown): void {
    MfaTrustSessionRevokeAllValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaTrustSessionRevokeAllDto {
    return MfaTrustSessionRevokeAllValidator.schema.parse(input);
  }
}

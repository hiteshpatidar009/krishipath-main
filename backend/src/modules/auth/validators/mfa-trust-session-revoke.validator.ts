import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { MfaTrustSessionRevokeDto } from "../dto/mfa-trust-session.dto";

export class MfaTrustSessionRevokeValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    trustSessionId: z.string().uuid(),
  });

  public validate(input: unknown): void {
    MfaTrustSessionRevokeValidator.schema.parse(input);
  }

  public parse(input: unknown): MfaTrustSessionRevokeDto {
    return MfaTrustSessionRevokeValidator.schema.parse(input);
  }
}

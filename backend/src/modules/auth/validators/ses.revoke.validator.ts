import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { SessionRevokeDto } from "../dto/ses.revoke.dto";

export class SessionRevokeValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    sessionId: z.string().uuid(),
    reason: z.string().trim().min(2).optional(),
  });

  public validate(input: unknown): void {
    SessionRevokeValidator.schema.parse(input);
  }

  public parse(input: unknown): SessionRevokeDto {
    return SessionRevokeValidator.schema.parse(input);
  }
}

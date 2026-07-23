import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { EmailStartDto } from "../dto/email.start.dto";

export class EmailStartValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    email: z.string().trim().email(),
  });

  public validate(input: unknown): void {
    EmailStartValidator.schema.parse(input);
  }

  public parse(input: unknown): EmailStartDto {
    return EmailStartValidator.schema.parse(input);
  }
}

import { z } from "zod";
import { EmailDto } from "../dto/email.dto";

export class EmailValidator {
  private readonly schema = z.object({
    to: z.string().email().max(255),
    subject: z.string().min(1).max(255),
    body: z.string().min(1).max(20000),
    companyId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  });

  public parse(input: unknown): EmailDto {
    return new EmailDto(this.schema.parse(input));
  }
}

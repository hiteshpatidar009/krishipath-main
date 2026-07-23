import { z } from "zod";
import { SmsDto } from "../dto/sms.dto";

export class SmsValidator {
  private readonly schema = z.object({
    to: z.string().min(8).max(20).regex(/^\+?[0-9]+$/),
    message: z.string().min(1).max(1000),
    channel: z.enum(["sms", "whatsapp"]).optional().default("sms"),
    companyId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  });

  public parse(input: unknown): SmsDto {
    return new SmsDto(this.schema.parse(input));
  }
}

import { z } from "zod";
import { TemplateDto } from "../dto/template.dto";

export class TemplateValidator {
  private readonly schema = z.object({
    companyId: z.string().uuid(),
    templateKey: z.string().min(2).max(120),
    channel: z.enum(["email", "sms", "push", "in_app"]),
    subject: z.string().min(1).max(255).optional(),
    body: z.string().min(1).max(20000),
  }).refine((value) => value.channel !== "email" || Boolean(value.subject), {
    message: "subject is required for email templates",
  });

  public parse(input: unknown): TemplateDto {
    return new TemplateDto(this.schema.parse(input));
  }
}

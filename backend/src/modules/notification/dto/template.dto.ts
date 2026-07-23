export class TemplateDto {
  public readonly companyId: string;
  public readonly templateKey: string;
  public readonly channel: "email" | "sms" | "push" | "in_app";
  public readonly subject?: string;
  public readonly body: string;

  constructor(input: TemplateDto) {
    this.companyId = input.companyId;
    this.templateKey = input.templateKey;
    this.channel = input.channel;
    this.subject = input.subject;
    this.body = input.body;
  }
}

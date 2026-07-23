export class NotificationDto {
  public readonly companyId: string;
  public readonly userId?: string;
  public readonly channel: "email" | "sms" | "push" | "in_app";
  public readonly templateKey?: string;
  public readonly recipient: string;
  public readonly subject?: string;
  public readonly body: string;
  public readonly dedupKey?: string;

  constructor(input: NotificationDto) {
    this.companyId = input.companyId;
    this.userId = input.userId;
    this.channel = input.channel;
    this.templateKey = input.templateKey;
    this.recipient = input.recipient;
    this.subject = input.subject;
    this.body = input.body;
    this.dedupKey = input.dedupKey;
  }
}

export class MessageDto {
  public readonly channel: "email" | "sms" | "push";
  public readonly recipient: string;
  public readonly subject?: string;
  public readonly body: string;
  public readonly companyId?: string;
  public readonly userId?: string;
  public readonly metadata?: unknown;

  constructor(input: MessageDto) {
    this.channel = input.channel;
    this.recipient = input.recipient;
    this.subject = input.subject;
    this.body = input.body;
    this.companyId = input.companyId;
    this.userId = input.userId;
    this.metadata = input.metadata;
  }
}

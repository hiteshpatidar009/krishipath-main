export class SmsDto {
  public readonly to: string;
  public readonly message: string;
  public readonly channel?: "sms" | "whatsapp";
  public readonly companyId?: string;
  public readonly userId?: string;
  public readonly singleAttempt?: boolean;

  constructor(input: SmsDto) {
    this.to = input.to;
    this.message = input.message;
    this.channel = input.channel;
    this.companyId = input.companyId;
    this.userId = input.userId;
    this.singleAttempt = input.singleAttempt;
  }
}

export interface EmailAttachmentDto {
  readonly content: string;
  readonly filename: string;
  readonly type: string;
  readonly disposition: "attachment" | "inline";
  readonly contentId?: string;
}

export class EmailDto {
  public readonly to: string;
  public readonly subject: string;
  public readonly body: string;
  public readonly htmlBody?: string;
  public readonly attachments?: readonly EmailAttachmentDto[];
  public readonly companyId?: string;
  public readonly userId?: string;
  public readonly singleAttempt?: boolean;

  constructor(input: EmailDto) {
    this.to = input.to;
    this.subject = input.subject;
    this.body = input.body;
    this.htmlBody = input.htmlBody;
    this.attachments = input.attachments;
    this.companyId = input.companyId;
    this.userId = input.userId;
    this.singleAttempt = input.singleAttempt;
  }
}

export class PushDto {
  public readonly userId: string;
  public readonly title: string;
  public readonly message: string;
  public readonly companyId?: string;
  public readonly data?: unknown;

  constructor(input: PushDto) {
    this.userId = input.userId;
    this.title = input.title;
    this.message = input.message;
    this.companyId = input.companyId;
    this.data = input.data;
  }
}

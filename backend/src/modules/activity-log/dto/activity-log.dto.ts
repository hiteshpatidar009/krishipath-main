export class ActivityLogDto {
  public readonly companyId?: string;
  public readonly userId?: string;
  public readonly activityType: string;
  public readonly description: string;
  public readonly metadata?: unknown;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly requestId?: string;

  constructor(input: ActivityLogDto) {
    this.companyId = input.companyId;
    this.userId = input.userId;
    this.activityType = input.activityType;
    this.description = input.description;
    this.metadata = input.metadata;
    this.ipAddress = input.ipAddress;
    this.userAgent = input.userAgent;
    this.requestId = input.requestId;
  }
}

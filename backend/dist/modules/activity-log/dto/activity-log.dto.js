export class ActivityLogDto {
    companyId;
    userId;
    activityType;
    description;
    metadata;
    ipAddress;
    userAgent;
    requestId;
    constructor(input) {
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

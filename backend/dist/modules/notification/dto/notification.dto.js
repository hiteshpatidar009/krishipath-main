export class NotificationDto {
    companyId;
    userId;
    channel;
    templateKey;
    recipient;
    subject;
    body;
    dedupKey;
    constructor(input) {
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

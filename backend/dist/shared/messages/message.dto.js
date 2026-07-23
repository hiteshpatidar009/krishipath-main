export class MessageDto {
    channel;
    recipient;
    subject;
    body;
    companyId;
    userId;
    metadata;
    constructor(input) {
        this.channel = input.channel;
        this.recipient = input.recipient;
        this.subject = input.subject;
        this.body = input.body;
        this.companyId = input.companyId;
        this.userId = input.userId;
        this.metadata = input.metadata;
    }
}

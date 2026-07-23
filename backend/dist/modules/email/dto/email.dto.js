export class EmailDto {
    to;
    subject;
    body;
    htmlBody;
    attachments;
    companyId;
    userId;
    singleAttempt;
    constructor(input) {
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

export class SmsDto {
    to;
    message;
    channel;
    companyId;
    userId;
    singleAttempt;
    constructor(input) {
        this.to = input.to;
        this.message = input.message;
        this.channel = input.channel;
        this.companyId = input.companyId;
        this.userId = input.userId;
        this.singleAttempt = input.singleAttempt;
    }
}

export class TemplateDto {
    companyId;
    templateKey;
    channel;
    subject;
    body;
    constructor(input) {
        this.companyId = input.companyId;
        this.templateKey = input.templateKey;
        this.channel = input.channel;
        this.subject = input.subject;
        this.body = input.body;
    }
}

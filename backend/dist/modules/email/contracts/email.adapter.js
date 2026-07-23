import { EmailDto } from "../dto/email.dto";
export class EmailContractAdapter {
    service;
    moduleName = "email";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async send(command) {
        await this.service.send(new EmailDto({
            to: command.to,
            subject: command.subject,
            body: command.body,
            companyId: command.companyId,
        }));
    }
}

import { SmsDto } from "../dto/sms.dto";
export class SmsContractAdapter {
    service;
    moduleName = "sms";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async send(command) {
        await this.service.send(new SmsDto({
            to: command.to,
            message: command.body,
            channel: command.channel,
            companyId: command.companyId,
        }));
    }
}

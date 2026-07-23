import { PushDto } from "../dto/push.dto";
export class PushNotificationContractAdapter {
    service;
    moduleName = "push-notification";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async send(command) {
        await this.service.send(new PushDto({
            userId: command.userId,
            title: command.title,
            message: command.body,
            companyId: command.companyId,
            data: command.data,
        }));
    }
}

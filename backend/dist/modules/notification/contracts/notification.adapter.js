import { NotificationDto } from "../dto/notification.dto";
export class NotificationContractAdapter {
    service;
    moduleName = "notification";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async send(command) {
        await this.service.create(new NotificationDto({
            companyId: command.companyId ?? "",
            userId: command.recipientId,
            channel: command.channel,
            templateKey: command.templateKey,
            recipient: command.recipient,
            subject: command.subject,
            body: command.body,
        }));
    }
}

import { EmailDto } from "../../email/dto/email.dto";
import { PushDto } from "../../push-notification/dto/push.dto";
import { SmsDto } from "../../sms/dto/sms.dto";
export class NotificationDispatchService {
    emailService;
    smsService;
    pushService;
    constructor(emailService, smsService, pushService) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
    }
    async dispatch(dto) {
        if (dto.channel === "email") {
            const sent = await this.emailService.send(new EmailDto({
                to: dto.recipient,
                subject: dto.subject ?? "Notification",
                body: dto.body,
                companyId: dto.companyId,
                userId: dto.userId,
            }));
            return { status: sent.status, providerMessageId: sent.messageId };
        }
        if (dto.channel === "sms") {
            const sent = await this.smsService.send(new SmsDto({
                to: dto.recipient,
                message: dto.body,
                companyId: dto.companyId,
                userId: dto.userId,
            }));
            return { status: sent.status, providerMessageId: sent.messageId };
        }
        if (dto.channel === "push") {
            const sent = await this.pushService.send(new PushDto({
                userId: dto.recipient,
                title: dto.subject ?? "Notification",
                message: dto.body,
                companyId: dto.companyId,
            }));
            return { status: sent.status, providerMessageId: sent.messageId };
        }
        return { status: "in_app_created" };
    }
}

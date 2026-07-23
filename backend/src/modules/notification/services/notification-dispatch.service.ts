import { EmailDto } from "../../email/dto/email.dto";
import { EmailService } from "../../email/services/email.service";
import { PushDto } from "../../push-notification/dto/push.dto";
import { PushService } from "../../push-notification/services/push.service";
import { SmsDto } from "../../sms/dto/sms.dto";
import { SmsService } from "../../sms/services/sms.service";
import { NotificationDto } from "../dto/notification.dto";

export class NotificationDispatchService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {}

  public async dispatch(dto: NotificationDto): Promise<{ status: string; providerMessageId?: string }> {
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

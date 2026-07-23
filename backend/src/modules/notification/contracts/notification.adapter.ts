import { NotificationDto } from "../dto/notification.dto";
import { NotificationService } from "../services/notification.service";
import {
  NotificationCommand,
  NotificationContract,
} from "./notification.contract";

export class NotificationContractAdapter implements NotificationContract {
  public readonly moduleName = "notification";
  public readonly version = "1.0.0";

  constructor(private readonly service: NotificationService) {}

  public async send(command: NotificationCommand): Promise<void> {
    await this.service.create(
      new NotificationDto({
        companyId: command.companyId ?? "",
        userId: command.recipientId,
        channel: command.channel,
        templateKey: command.templateKey,
        recipient: command.recipient,
        subject: command.subject,
        body: command.body,
      }),
    );
  }
}

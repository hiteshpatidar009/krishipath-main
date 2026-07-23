import { PushDto } from "../dto/push.dto";
import { PushService } from "../services/push.service";
import { PushCommand, PushNotificationContract } from "./push.contract";

export class PushNotificationContractAdapter
  implements PushNotificationContract
{
  public readonly moduleName = "push-notification";
  public readonly version = "1.0.0";

  constructor(private readonly service: PushService) {}

  public async send(command: PushCommand): Promise<void> {
    await this.service.send(
      new PushDto({
        userId: command.userId,
        title: command.title,
        message: command.body,
        companyId: command.companyId,
        data: command.data,
      }),
    );
  }
}

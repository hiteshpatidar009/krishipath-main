import { SmsDto } from "../dto/sms.dto";
import { SmsService } from "../services/sms.service";
import { SmsCommand, SmsContract } from "./sms.contract";

export class SmsContractAdapter implements SmsContract {
  public readonly moduleName = "sms";
  public readonly version = "1.0.0";

  constructor(private readonly service: SmsService) {}

  public async send(command: SmsCommand): Promise<void> {
    await this.service.send(
      new SmsDto({
        to: command.to,
        message: command.body,
        channel: command.channel,
        companyId: command.companyId,
      }),
    );
  }
}

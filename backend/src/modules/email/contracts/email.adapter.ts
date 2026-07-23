import { EmailDto } from "../dto/email.dto";
import { EmailService } from "../services/email.service";
import { EmailContract, EmailSendCommand } from "./email.contract";

export class EmailContractAdapter implements EmailContract {
  public readonly moduleName = "email";
  public readonly version = "1.0.0";

  constructor(private readonly service: EmailService) {}

  public async send(command: EmailSendCommand): Promise<void> {
    await this.service.send(
      new EmailDto({
        to: command.to,
        subject: command.subject,
        body: command.body,
        companyId: command.companyId,
      }),
    );
  }
}

import { ModuleContract } from "../../../core";

export interface EmailSendCommand {
  readonly companyId?: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly templateKey?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface EmailContract extends ModuleContract {
  send(command: EmailSendCommand): Promise<void>;
}

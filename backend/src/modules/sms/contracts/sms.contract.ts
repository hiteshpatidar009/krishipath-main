import { ModuleContract } from "../../../core";

export interface SmsCommand {
  readonly companyId?: string;
  readonly to: string;
  readonly body: string;
  readonly channel?: "sms" | "whatsapp";
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface SmsContract extends ModuleContract {
  send(command: SmsCommand): Promise<void>;
}

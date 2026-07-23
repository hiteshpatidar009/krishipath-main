import { ModuleContract } from "../../../core";

export interface PushCommand {
  readonly companyId?: string;
  readonly userId: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Readonly<Record<string, string>>;
}

export interface PushNotificationContract extends ModuleContract {
  send(command: PushCommand): Promise<void>;
}

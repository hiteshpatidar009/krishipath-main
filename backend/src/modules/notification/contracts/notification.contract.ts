import { ModuleContract } from "../../../core";

export interface NotificationCommand {
  readonly companyId?: string;
  readonly recipientId?: string;
  readonly recipient: string;
  readonly channel: "email" | "sms" | "push" | "in_app";
  readonly templateKey?: string;
  readonly subject?: string;
  readonly body: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface NotificationContract extends ModuleContract {
  send(command: NotificationCommand): Promise<void>;
}

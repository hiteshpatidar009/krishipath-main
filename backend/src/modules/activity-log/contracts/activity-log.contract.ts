import { ModuleContract } from "../../../core";

export interface ActivityLogCommand {
  readonly companyId?: string;
  readonly userId?: string;
  readonly action: string;
  readonly module: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface ActivityLogContract extends ModuleContract {
  record(command: ActivityLogCommand): Promise<void>;
}

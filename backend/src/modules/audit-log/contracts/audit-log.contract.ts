import { ModuleContract } from "../../../core";

export interface AuditLogCommand {
  readonly companyId?: string;
  readonly userId?: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId?: string;
  readonly before?: Readonly<Record<string, unknown>>;
  readonly after?: Readonly<Record<string, unknown>>;
}

export interface AuditLogContract extends ModuleContract {
  append(command: AuditLogCommand): Promise<void>;
}

import { ModuleContract } from "../../../core";

export interface PermissionView {
  readonly id: string;
  readonly key: string;
  readonly resource: string;
  readonly action: string;
}

export interface RolePermissionContract extends ModuleContract {
  hasPermission(userId: string, permissionKey: string): Promise<boolean>;
  listPermissions(): Promise<readonly PermissionView[]>;
}

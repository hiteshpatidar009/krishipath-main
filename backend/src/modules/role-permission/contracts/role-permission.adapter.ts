import {
  PermissionView,
  RolePermissionContract,
} from "./role-permission.contract";
import { RolePermissionRepository } from "../repositories/role-permission.repository";

export class RolePermissionContractAdapter implements RolePermissionContract {
  public readonly moduleName = "role-permission";
  public readonly version = "1.0.0";

  constructor(private readonly repository: RolePermissionRepository) {}

  public async hasPermission(
    userId: string,
    permissionKey: string,
  ): Promise<boolean> {
    return this.repository.hasPermission(userId, permissionKey);
  }

  public async listPermissions(): Promise<readonly PermissionView[]> {
    const permissions = await this.repository.listAllPermissions();
    return permissions.map((permission) => ({
      id: permission.id,
      key: permission.permissionKey ?? "",
      resource: permission.resource ?? "",
      action: permission.action ?? "",
    }));
  }
}

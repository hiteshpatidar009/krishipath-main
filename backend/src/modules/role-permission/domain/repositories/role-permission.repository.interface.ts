export interface RolePermissionReadRepository {
  hasPermission(userId: string, permissionKey: string): Promise<boolean>;
  listRolePermissionKeys(roleId: string): Promise<readonly string[]>;
}

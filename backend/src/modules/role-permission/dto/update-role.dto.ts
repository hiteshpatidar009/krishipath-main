export interface UpdateRoleDto {
  name?: string;
  description?: string;
  color?: string;
  permissionIds?: string[];
  permissionKeys?: string[];
  assignAll?: boolean;
  parentRoleId?: string | null;
}


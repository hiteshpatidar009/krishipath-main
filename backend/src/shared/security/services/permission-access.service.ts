import { SecurityContextDto } from "../dtos/security-context.dto";

export class PermissionAccessService {
  public static canAccessPermissions(
    context: SecurityContextDto | undefined,
    requiredPermissions: readonly string[],
  ): boolean {
    if (!context) {
      return false;
    }

    if (PermissionAccessService.hasRootOwnerAccess(context)) {
      return true;
    }

    const granted = context.permissions ?? [];
    return requiredPermissions.every((permission) =>
      PermissionAccessService.hasPermission(granted, permission),
    );
  }

  public static canAccessRoles(
    context: SecurityContextDto | undefined,
    requiredRoles: readonly string[],
  ): boolean {
    if (!context) {
      return false;
    }

    if (PermissionAccessService.hasRootOwnerAccess(context)) {
      return true;
    }

    const granted = context.roles ?? [];
    return requiredRoles.some((role) => granted.includes(role));
  }

  private static hasRootOwnerAccess(context: SecurityContextDto): boolean {
    return Boolean(
      context.isRoot && context.authType === "root"
    );
  }

  private static hasPermission(
    grantedPermissions: readonly string[],
    requiredPermission: string,
  ): boolean {
    const moduleName = requiredPermission.split(".")[0] ?? requiredPermission.split(":")[0];
    return (
      grantedPermissions.includes("*") ||
      grantedPermissions.includes(requiredPermission) ||
      grantedPermissions.includes(`${moduleName}.*`) ||
      grantedPermissions.includes(`${moduleName}:*`)
    );
  }
}

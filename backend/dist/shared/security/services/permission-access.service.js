export class PermissionAccessService {
    static canAccessPermissions(context, requiredPermissions) {
        if (!context) {
            return false;
        }
        if (PermissionAccessService.hasRootOwnerAccess(context)) {
            return true;
        }
        const granted = context.permissions ?? [];
        return requiredPermissions.every((permission) => PermissionAccessService.hasPermission(granted, permission));
    }
    static canAccessRoles(context, requiredRoles) {
        if (!context) {
            return false;
        }
        if (PermissionAccessService.hasRootOwnerAccess(context)) {
            return true;
        }
        const granted = context.roles ?? [];
        return requiredRoles.some((role) => granted.includes(role));
    }
    static hasRootOwnerAccess(context) {
        return Boolean(context.isRoot && context.authType === "root");
    }
    static hasPermission(grantedPermissions, requiredPermission) {
        const moduleName = requiredPermission.split(".")[0] ?? requiredPermission.split(":")[0];
        return (grantedPermissions.includes("*") ||
            grantedPermissions.includes(requiredPermission) ||
            grantedPermissions.includes(`${moduleName}.*`) ||
            grantedPermissions.includes(`${moduleName}:*`));
    }
}

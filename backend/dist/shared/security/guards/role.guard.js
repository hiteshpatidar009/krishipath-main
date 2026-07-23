import { PermissionAccessService } from "../services/permission-access.service";
export class RoleGuard {
    static require(...roles) {
        return (request, response, next) => {
            if (!PermissionAccessService.canAccessRoles(request.securityContext, roles)) {
                response.status(403).json({
                    success: false,
                    message: "Role denied",
                });
                return;
            }
            next();
        };
    }
}

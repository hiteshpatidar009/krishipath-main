import { PermissionAccessService } from "../services/permission-access.service";
export class AuthorizationMiddleware {
    static requirePermissions(...permissions) {
        return (request, response, next) => {
            if (!PermissionAccessService.canAccessPermissions(request.securityContext, permissions)) {
                response.status(403).json({
                    success: false,
                    message: "Permission denied",
                });
                return;
            }
            next();
        };
    }
}

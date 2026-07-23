import { PermissionAccessService } from "../services/permission-access.service";
export class PermGuard {
    static require(...permissions) {
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

import { PlatformLogViewerPermission } from "./platform-log-viewer.permission";
export class PlatformSuperAdminOnlyGuard {
    static use(request, response, next) {
        const context = request.securityContext;
        if (context?.permissions?.includes(PlatformLogViewerPermission.Export) ||
            context?.roles?.some((role) => role.toLowerCase() === "platform super admin")) {
            next();
            return;
        }
        response.status(403).json({
            success: false,
            message: "Platform super admin access required",
        });
    }
}

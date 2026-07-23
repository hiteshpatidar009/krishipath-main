import { PlatformLogViewerPermission } from "./platform-log-viewer.permission";
export class PlatformAdminOnlyGuard {
    static use(request, response, next) {
        const context = request.securityContext;
        if (context?.permissions?.includes(PlatformLogViewerPermission.Read) ||
            context?.roles?.some((role) => role.toLowerCase() === "platform admin")) {
            next();
            return;
        }
        response.status(403).json({
            success: false,
            message: "Platform log access denied",
        });
    }
}

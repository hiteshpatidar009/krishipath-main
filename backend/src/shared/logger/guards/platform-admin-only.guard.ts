import { NextFunction, Response } from "express";
import { SecurityRequest } from "../../security/types/security-request.type";
import { PlatformLogViewerPermission } from "./platform-log-viewer.permission";

export class PlatformAdminOnlyGuard {
  public static use(request: SecurityRequest, response: Response, next: NextFunction): void {
    const context = request.securityContext;
    if (
      context?.permissions?.includes(PlatformLogViewerPermission.Read) ||
      context?.roles?.some((role) => role.toLowerCase() === "platform admin")
    ) {
      next();
      return;
    }

    response.status(403).json({
      success: false,
      message: "Platform log access denied",
    });
  }
}

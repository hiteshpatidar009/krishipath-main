import { NextFunction, Response } from "express";
import { PermissionAccessService } from "../services/permission-access.service";
import { SecurityRequest } from "../types/security-request.type";

export class RoleGuard {
  public static require(...roles: string[]) {
    return (request: SecurityRequest, response: Response, next: NextFunction): void => {
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

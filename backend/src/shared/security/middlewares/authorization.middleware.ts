import { NextFunction, Response } from "express";
import { PermissionAccessService } from "../services/permission-access.service";
import { SecurityRequest } from "../types/security-request.type";

export class AuthorizationMiddleware {
  public static requirePermissions(...permissions: string[]) {
    return (request: SecurityRequest, response: Response, next: NextFunction): void => {
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

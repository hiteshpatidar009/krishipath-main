import { NextFunction, Response } from "express";
import { SecurityRequest } from "../security/types/security-request.type";

export class AuditLogAccessGuard {
  public static use(request: SecurityRequest, response: Response, next: NextFunction): void {
    const context = request.securityContext;
    const roles = context?.roles?.map((role) => role.toLowerCase()) ?? [];
    const permissions = context?.permissions ?? [];
    const isCompanyAdmin = roles.some((role) =>
      ["company admin", "company administrator", "administrator", "admin", "owner"].includes(role),
    );

    if (
      context?.isCompanyOwner ||
      isCompanyAdmin ||
      permissions.includes("audit.log.read")
    ) {
      next();
      return;
    }

    response.status(403).json({
      success: false,
      message: "Audit log access denied",
    });
  }
}

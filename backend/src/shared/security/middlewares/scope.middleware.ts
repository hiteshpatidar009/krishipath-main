import { NextFunction, Request, Response } from "express";

import { RequestContext } from "../../context/request-context";

export class OrgScopeMiddleware {
  public static requireOrg(request: Request, response: Response, next: NextFunction): void {
    const organizationId = request.header("x-organization-id") ?? request.params.organizationId;
    if (!organizationId) {
      response.status(403).json({ success: false, message: "Organization scope required" });
      return;
    }
    (request as Request & { organizationId?: string }).organizationId = String(organizationId);
    next();
  }
}

export class WarehouseScopeMiddleware {
  public static requireWarehouse(request: Request, response: Response, next: NextFunction): void {
    const warehouseId = request.header("x-warehouse-id") ?? request.params.warehouseId;
    if (!warehouseId) {
      response.status(403).json({ success: false, message: "Warehouse scope required" });
      return;
    }
    RequestContext.companyId(request);
    (request as Request & { warehouseId?: string }).warehouseId = String(warehouseId);
    next();
  }
}

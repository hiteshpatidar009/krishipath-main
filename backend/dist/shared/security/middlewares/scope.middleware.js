import { RequestContext } from "../../context/request-context";
export class OrgScopeMiddleware {
    static requireOrg(request, response, next) {
        const organizationId = request.header("x-organization-id") ?? request.params.organizationId;
        if (!organizationId) {
            response.status(403).json({ success: false, message: "Organization scope required" });
            return;
        }
        request.organizationId = String(organizationId);
        next();
    }
}
export class WarehouseScopeMiddleware {
    static requireWarehouse(request, response, next) {
        const warehouseId = request.header("x-warehouse-id") ?? request.params.warehouseId;
        if (!warehouseId) {
            response.status(403).json({ success: false, message: "Warehouse scope required" });
            return;
        }
        RequestContext.companyId(request);
        request.warehouseId = String(warehouseId);
        next();
    }
}

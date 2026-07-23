import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class InventoryRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/balances/overview", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.overview);
        this.router.get("/balances/alerts", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.getAlerts);
        this.router.get("/balances/export", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.exportBalances);
        this.router.get("/balances/by-location", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.byLocation);
        this.router.get("/balances/by-location/export", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.exportByLocation);
        this.router.get("/balances/by-location/kpis", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.locationKpis);
        this.router.get("/balances", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.listBalances);
        this.router.get("/reports/aging", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.agingReport);
        this.router.get("/reports/aging/details", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.agingDetails);
        this.router.get("/balances/:stockItemId", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.getBalance);
        this.router.get("/availability/:skuId", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.availability);
        this.router.get("/movements", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.movements);
        this.router.post("/receipts", AuthorizationMiddleware.requirePermissions("warehouse.receiving.create"), IdempotencyMiddleware.requireForMutations(), controller.receive);
    }
    getRouter() {
        return this.router;
    }
}

import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class StockReservationRoutes {
    router = Router();
    constructor(controller) {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.list);
        this.router.get("/summary", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.summary);
        this.router.get("/activities", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.activities);
        this.router.get("/:reservationId", AuthorizationMiddleware.requirePermissions("inventory.stock.read"), controller.get);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("inventory.stock.reserve"), IdempotencyMiddleware.requireForMutations(), controller.create);
        this.router.post("/:reservationId/release", AuthorizationMiddleware.requirePermissions("inventory.stock.reserve"), IdempotencyMiddleware.requireForMutations(), controller.release);
        this.router.post("/:reservationId/allocate", AuthorizationMiddleware.requirePermissions("inventory.stock.reserve"), IdempotencyMiddleware.requireForMutations(), controller.allocate);
        this.router.post("/:reservationId/fulfill", AuthorizationMiddleware.requirePermissions("inventory.stock.reserve"), IdempotencyMiddleware.requireForMutations(), controller.fulfill);
        this.router.post("/expire", AuthorizationMiddleware.requirePermissions("inventory.stock.reserve"), IdempotencyMiddleware.requireForMutations(), controller.expire);
    }
    getRouter() {
        return this.router;
    }
}

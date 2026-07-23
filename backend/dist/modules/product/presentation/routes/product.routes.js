import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../../shared/security";
export class ProductRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("inventory.product.create"), IdempotencyMiddleware.requireForMutations(), this.controller.create);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("inventory.product.read"), this.controller.list);
        this.router.post("/categories", AuthorizationMiddleware.requirePermissions("inventory.product.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createCategory);
        this.router.get("/categories", AuthorizationMiddleware.requirePermissions("inventory.product.read"), this.controller.listCategories);
        this.router.post("/brands", AuthorizationMiddleware.requirePermissions("inventory.product.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createBrand);
        this.router.get("/brands", AuthorizationMiddleware.requirePermissions("inventory.product.read"), this.controller.listBrands);
        this.router.post("/units", AuthorizationMiddleware.requirePermissions("inventory.product.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createUnit);
        this.router.get("/units", AuthorizationMiddleware.requirePermissions("inventory.product.read"), this.controller.listUnits);
        this.router.get("/skus/:skuId", AuthorizationMiddleware.requirePermissions("inventory.product.read"), this.controller.getSku);
        this.router.post("/skus/:skuId/archive", AuthorizationMiddleware.requirePermissions("inventory.product.update"), IdempotencyMiddleware.requireForMutations(), this.controller.archiveSku);
        this.router.get("/:productId", AuthorizationMiddleware.requirePermissions("inventory.product.read"), this.controller.get);
        this.router.patch("/:productId", AuthorizationMiddleware.requirePermissions("inventory.product.update"), IdempotencyMiddleware.requireForMutations(), this.controller.update);
    }
}

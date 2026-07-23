import { Router } from "express";
export class MandiRoutes {
    mandiController;
    router = Router();
    constructor(mandiController) {
        this.mandiController = mandiController;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get("/", this.mandiController.getMandis);
        this.router.get("/compare", this.mandiController.compareProduct);
        this.router.get("/nearby", this.mandiController.getNearbyMandis);
        this.router.get("/:id/overview", this.mandiController.getMandiOverview);
        this.router.get("/:id/products/:productId/detail", this.mandiController.getProductDetail);
        this.router.get("/:id/products", this.mandiController.getMandiCrops);
        this.router.get("/:id/market-rates", this.mandiController.getMarketRates);
        this.router.get("/:id", this.mandiController.getMandiDetails);
    }
    getRouter() {
        return this.router;
    }
}

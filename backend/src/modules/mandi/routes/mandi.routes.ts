import { Router } from "express";
import { MandiController } from "../controllers/mandi.controller";

export class MandiRoutes {
  private readonly router = Router();

  constructor(private readonly mandiController: MandiController) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/", this.mandiController.getMandis);
    this.router.get("/compare", this.mandiController.compareProduct);
    this.router.get("/nearby", this.mandiController.getNearbyMandis);
    this.router.get("/:id/overview", this.mandiController.getMandiOverview);
    this.router.get("/:id/products/:productId/detail", this.mandiController.getProductDetail);
    this.router.get("/:id/products", this.mandiController.getMandiCrops);
    this.router.get("/:id/market-rates", this.mandiController.getMarketRates);
    this.router.get("/:id", this.mandiController.getMandiDetails);
  }

  public getRouter(): Router {
    return this.router;
  }
}

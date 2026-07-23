import { Router } from "express";
import { MarketSourceService } from "./market-source.service";
import { MarketSourceController } from "./market-source.controller";
import { MarketSourceRoutes } from "./market-source.routes";

export class MarketSourceModule {
  private readonly marketSourceService: MarketSourceService;
  private readonly marketSourceController: MarketSourceController;
  private readonly marketSourceRoutes: MarketSourceRoutes;

  constructor() {
    this.marketSourceService = new MarketSourceService();
    this.marketSourceController = new MarketSourceController(this.marketSourceService);
    this.marketSourceRoutes = new MarketSourceRoutes(this.marketSourceController);
  }

  public getRouter(): Router {
    return this.marketSourceRoutes.getRouter();
  }
}

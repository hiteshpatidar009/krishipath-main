import { Router } from "express";
import { FarmerController } from "./controllers/farmer.controller";
import { FarmerRepository } from "./repositories/farmer.repository";
import { FarmerRoutes } from "./routes/farmer.routes";
import { FarmerService } from "./services/farmer.service";
import { CoreEventDispatcher, EventDispatcher } from "../../core/events";
import { MandiProductRepository } from "../mandi/repositories/mandi-product.repository";

export class FarmerModule {
  private readonly farmerRepository: FarmerRepository;
  private readonly eventDispatcher: EventDispatcher;
  private readonly mandiProductRepository: MandiProductRepository;
  private readonly farmerService: FarmerService;
  private readonly farmerController: FarmerController;
  private readonly farmerRoutes: FarmerRoutes;

  constructor() {
    this.farmerRepository = new FarmerRepository();
    this.mandiProductRepository = new MandiProductRepository();
    this.eventDispatcher = CoreEventDispatcher;
    this.farmerService = new FarmerService(
      this.farmerRepository,
      this.eventDispatcher,
      this.mandiProductRepository,
    );
    this.farmerController = new FarmerController(this.farmerService);
    this.farmerRoutes = new FarmerRoutes(this.farmerController);
  }

  public getRouter(): Router {
    return this.farmerRoutes.getRouter();
  }
}

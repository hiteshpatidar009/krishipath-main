import { Router } from "express";
import { TraderController } from "./controllers/trader.controller";
import { TraderRepository } from "./repositories/trader.repository";
import { PriceRepository } from "../mandi/repositories/price.repository";
import { TraderRoutes } from "./routes/trader.routes";
import { TraderService } from "./services/trader.service";
import { CoreEventDispatcher, EventDispatcher } from "../../core/events";

export class TraderModule {
  private readonly traderRepository: TraderRepository;
  private readonly priceRepository: PriceRepository;
  private readonly eventDispatcher: EventDispatcher;
  private readonly traderService: TraderService;
  private readonly traderController: TraderController;
  private readonly traderRoutes: TraderRoutes;

  constructor() {
    this.traderRepository = new TraderRepository();
    this.priceRepository = new PriceRepository();
    this.eventDispatcher = CoreEventDispatcher;
    
    this.traderService = new TraderService(
      this.traderRepository,
      this.priceRepository,
      this.eventDispatcher
    );
    this.traderController = new TraderController(this.traderService);
    this.traderRoutes = new TraderRoutes(this.traderController);
  }

  public getRouter(): Router {
    return this.traderRoutes.getRouter();
  }
}

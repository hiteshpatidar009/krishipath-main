import { TraderController } from "./controllers/trader.controller";
import { TraderRepository } from "./repositories/trader.repository";
import { PriceRepository } from "../mandi/repositories/price.repository";
import { TraderRoutes } from "./routes/trader.routes";
import { TraderService } from "./services/trader.service";
import { CoreEventDispatcher } from "../../core/events";
export class TraderModule {
    traderRepository;
    priceRepository;
    eventDispatcher;
    traderService;
    traderController;
    traderRoutes;
    constructor() {
        this.traderRepository = new TraderRepository();
        this.priceRepository = new PriceRepository();
        this.eventDispatcher = CoreEventDispatcher;
        this.traderService = new TraderService(this.traderRepository, this.priceRepository, this.eventDispatcher);
        this.traderController = new TraderController(this.traderService);
        this.traderRoutes = new TraderRoutes(this.traderController);
    }
    getRouter() {
        return this.traderRoutes.getRouter();
    }
}

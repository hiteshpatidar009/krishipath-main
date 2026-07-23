import { MarketInsightController } from "./controllers/market-insight.controller";
import { MarketInsightRepository } from "./repositories/market-insight.repository";
import { MarketInsightRoutes } from "./routes/market-insight.routes";
import { MarketInsightService } from "./services/market-insight.service";
export class MarketInsightModule {
    marketInsightRepository;
    marketInsightService;
    marketInsightController;
    marketInsightRoutes;
    constructor() {
        this.marketInsightRepository = new MarketInsightRepository();
        this.marketInsightService = new MarketInsightService(this.marketInsightRepository);
        this.marketInsightController = new MarketInsightController(this.marketInsightService);
        this.marketInsightRoutes = new MarketInsightRoutes(this.marketInsightController);
    }
    getRouter() {
        return this.marketInsightRoutes.getRouter();
    }
}

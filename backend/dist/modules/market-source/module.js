import { MarketSourceService } from "./market-source.service";
import { MarketSourceController } from "./market-source.controller";
import { MarketSourceRoutes } from "./market-source.routes";
export class MarketSourceModule {
    marketSourceService;
    marketSourceController;
    marketSourceRoutes;
    constructor() {
        this.marketSourceService = new MarketSourceService();
        this.marketSourceController = new MarketSourceController(this.marketSourceService);
        this.marketSourceRoutes = new MarketSourceRoutes(this.marketSourceController);
    }
    getRouter() {
        return this.marketSourceRoutes.getRouter();
    }
}

import { FarmerController } from "./controllers/farmer.controller";
import { FarmerRepository } from "./repositories/farmer.repository";
import { FarmerRoutes } from "./routes/farmer.routes";
import { FarmerService } from "./services/farmer.service";
import { CoreEventDispatcher } from "../../core/events";
import { MandiProductRepository } from "../mandi/repositories/mandi-product.repository";
export class FarmerModule {
    farmerRepository;
    eventDispatcher;
    mandiProductRepository;
    farmerService;
    farmerController;
    farmerRoutes;
    constructor() {
        this.farmerRepository = new FarmerRepository();
        this.mandiProductRepository = new MandiProductRepository();
        this.eventDispatcher = CoreEventDispatcher;
        this.farmerService = new FarmerService(this.farmerRepository, this.eventDispatcher, this.mandiProductRepository);
        this.farmerController = new FarmerController(this.farmerService);
        this.farmerRoutes = new FarmerRoutes(this.farmerController);
    }
    getRouter() {
        return this.farmerRoutes.getRouter();
    }
}

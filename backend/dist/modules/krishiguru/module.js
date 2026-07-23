import { KrishiGuruController } from "./controllers/krishiguru.controller";
import { KrishiGuruRepository } from "./repositories/krishiguru.repository";
import { KrishiGuruRoutes } from "./routes/krishiguru.routes";
import { KrishiGuruService } from "./services/krishiguru.service";
import { CoreEventDispatcher } from "../../core/events";
export class KrishiGuruModule {
    krishiGuruRepository;
    krishiGuruService;
    krishiGuruController;
    krishiGuruRoutes;
    constructor() {
        this.krishiGuruRepository = new KrishiGuruRepository();
        this.krishiGuruService = new KrishiGuruService(this.krishiGuruRepository, CoreEventDispatcher);
        this.krishiGuruController = new KrishiGuruController(this.krishiGuruService);
        this.krishiGuruRoutes = new KrishiGuruRoutes(this.krishiGuruController);
    }
    getRouter() {
        return this.krishiGuruRoutes.getRouter();
    }
}

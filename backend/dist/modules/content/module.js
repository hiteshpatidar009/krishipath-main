import { ContentRepository } from "./repositories/content.repository";
import { ContentService } from "./services/content.service";
import { ContentController } from "./controllers/content.controller";
import { ContentAdminController } from "./controllers/content-admin.controller";
import { ContentRoutes } from "./routes/content.routes";
import { TranslationService } from "../localization/services/translation.service";
import { TranslationRepository } from "../localization/repositories/translation.repository";
import { RedisService } from "../../infrastructure/database/redis/redis.service";
export class ContentModule {
    contentRepository;
    contentService;
    contentController;
    contentAdminController;
    contentRoutes;
    constructor() {
        this.contentRepository = new ContentRepository();
        const translationRepository = new TranslationRepository();
        const redisService = new RedisService();
        const translationService = new TranslationService(translationRepository, redisService);
        this.contentService = new ContentService(this.contentRepository, translationService);
        this.contentController = new ContentController(this.contentService, translationService);
        this.contentAdminController = new ContentAdminController(this.contentService);
        this.contentRoutes = new ContentRoutes(this.contentController, this.contentAdminController);
    }
    getRouter() {
        return this.contentRoutes.getRouter();
    }
    getAdminRouter() {
        return this.contentRoutes.getAdminRouter();
    }
}

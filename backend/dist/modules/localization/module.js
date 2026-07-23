import { LanguageRepository } from "./repositories/language.repository";
import { TranslationRepository } from "./repositories/translation.repository";
import { LanguageService } from "./services/language.service";
import { TranslationService } from "./services/translation.service";
import { UniversalConceptDictionaryService } from "./services/dictionary.service";
import { LanguageController } from "./controllers/language.controller";
import { TranslationController } from "./controllers/translation.controller";
import { ConceptDictionaryController } from "./controllers/dictionary.controller";
import { LanguageResolverMiddleware } from "./middleware/language-resolver.middleware";
import { LocalizationRoutes } from "./routes/localization.routes";
import { RedisService } from "../../infrastructure/database/redis/redis.service";
export class LocalizationModule {
    languageRepo;
    translationRepo;
    redisService;
    languageService;
    translationService;
    conceptDictionaryService;
    languageController;
    translationController;
    dictionaryController;
    localizationRoutes;
    languageResolverMiddleware;
    constructor() {
        this.languageRepo = new LanguageRepository();
        this.translationRepo = new TranslationRepository();
        this.redisService = new RedisService();
        this.languageService = new LanguageService(this.languageRepo);
        this.translationService = new TranslationService(this.translationRepo, this.redisService);
        this.conceptDictionaryService = new UniversalConceptDictionaryService();
        this.languageResolverMiddleware = new LanguageResolverMiddleware(this.languageService);
        this.languageController = new LanguageController(this.languageService);
        this.translationController = new TranslationController(this.translationService);
        this.dictionaryController = new ConceptDictionaryController(this.conceptDictionaryService);
        this.localizationRoutes = new LocalizationRoutes(this.languageController, this.translationController, this.dictionaryController);
    }
    getRouter() {
        return this.localizationRoutes.getRouter();
    }
    /**
     * Returns the language resolver middleware handler for use in app.ts
     */
    getLanguageMiddleware() {
        return this.languageResolverMiddleware.use;
    }
}

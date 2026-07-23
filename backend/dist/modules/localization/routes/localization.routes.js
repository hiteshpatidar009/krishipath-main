import { Router } from "express";
export class LocalizationRoutes {
    languageController;
    translationController;
    dictionaryController;
    router = Router();
    constructor(languageController, translationController, dictionaryController) {
        this.languageController = languageController;
        this.translationController = translationController;
        this.dictionaryController = dictionaryController;
        this.setupRoutes();
    }
    setupRoutes() {
        // ─── Language Management ──────────────────────────────────────────────────
        // GET    /api/v1/localization/languages           → list all languages
        // POST   /api/v1/localization/languages           → create language
        // PATCH  /api/v1/localization/languages/:id       → update language
        this.router.get("/languages", this.languageController.listLanguages);
        this.router.post("/languages", this.languageController.createLanguage);
        this.router.patch("/languages/:id", this.languageController.updateLanguage);
        // ─── Translation Center ───────────────────────────────────────────────────
        // GET  /translations/missing?lang=mr&entityType=PRODUCT   → find untranslated entities
        // GET  /translations/:entityType/:entityId                 → all translations for entity
        // GET  /translations/resolve/:entityType/:entityId/:field  → resolve for req.lang
        // PUT  /translations                                        → upsert single translation
        // POST /translations/bulk                                   → bulk upsert
        // POST /translations/approve                                → approve a translation
        this.router.get("/translations/missing", this.translationController.getMissingTranslations);
        this.router.get("/translations/:entityType/:entityId", this.translationController.getEntityTranslations);
        this.router.get("/translations/resolve/:entityType/:entityId/:fieldName", this.translationController.resolveField);
        this.router.put("/translations", this.translationController.upsertTranslation);
        this.router.post("/translations/bulk", this.translationController.bulkUpsertTranslations);
        this.router.post("/translations/approve", this.translationController.approveTranslation);
        // ─── Concept Dictionary ───────────────────────────────────────────────────
        // POST /dictionary         → add single mapping (e.g. "Kanda" → Product:P001)
        // POST /dictionary/bulk    → bulk import mappings
        // POST /dictionary/resolve → test: resolve a raw term → entityId
        this.router.post("/dictionary", this.dictionaryController.addMapping);
        this.router.post("/dictionary/bulk", this.dictionaryController.bulkAddMappings);
        this.router.post("/dictionary/resolve", this.dictionaryController.resolveTerm);
    }
    getRouter() {
        return this.router;
    }
}

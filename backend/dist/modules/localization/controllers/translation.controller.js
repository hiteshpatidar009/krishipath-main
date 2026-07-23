import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class TranslationController {
    translationService;
    constructor(translationService) {
        this.translationService = translationService;
    }
    getEntityTranslations = async (req, res) => {
        try {
            const { entityType, entityId } = req.params;
            const translations = await this.translationService.getEntityTranslations(entityType, entityId);
            ApiResponse.ok(res, translations, "Translations fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    upsertTranslation = async (req, res) => {
        try {
            const { entityType, entityId, fieldName, languageCode, value } = req.body;
            if (!entityType || !entityId || !fieldName || !languageCode || value === undefined) {
                ApiResponse.badRequest(res, "entityType, entityId, fieldName, languageCode, and value are required");
                return;
            }
            const actorId = req.auth?.userId;
            const result = await this.translationService.upsert({
                entityType,
                entityId,
                fieldName,
                languageCode,
                value,
                translatedBy: actorId,
            });
            ApiResponse.ok(res, result, "Translation saved successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    bulkUpsertTranslations = async (req, res) => {
        try {
            const { records } = req.body;
            if (!Array.isArray(records) || records.length === 0) {
                ApiResponse.badRequest(res, "records array is required");
                return;
            }
            const actorId = req.auth?.userId;
            await this.translationService.bulkUpsert(records.map((r) => ({ ...r, translatedBy: actorId })));
            ApiResponse.ok(res, { count: records.length }, "Translations saved successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    approveTranslation = async (req, res) => {
        try {
            const { entityType, entityId, fieldName, languageCode } = req.body;
            const reviewedBy = req.auth?.userId;
            if (!reviewedBy) {
                ApiResponse.badRequest(res, "Authentication required");
                return;
            }
            await this.translationService.updateStatus(entityType, entityId, fieldName, languageCode, "APPROVED", reviewedBy);
            ApiResponse.ok(res, null, "Translation approved");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    resolveField = async (req, res) => {
        try {
            const { entityType, entityId, fieldName } = req.params;
            const lang = req.lang ?? "en";
            const value = await this.translationService.resolveField(entityType, entityId, fieldName, lang);
            ApiResponse.ok(res, { value, language: lang }, "Translation resolved");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    /**
     * GET /api/v1/localization/translations/missing?lang=mr&entityType=PRODUCT
     * Returns all entities that have English translations but are missing the requested language.
     */
    getMissingTranslations = async (req, res) => {
        try {
            const lang = req.query.lang || "hi";
            const entityType = req.query.entityType;
            const missing = await this.translationService.getMissingTranslations(lang, entityType);
            ApiResponse.ok(res, { lang, count: missing.length, missing }, "Missing translations fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

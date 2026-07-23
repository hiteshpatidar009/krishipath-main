import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class ConceptDictionaryController {
    dictionaryService;
    constructor(dictionaryService) {
        this.dictionaryService = dictionaryService;
    }
    /**
     * POST /api/v1/localization/dictionary
     * Add a new term → canonical entity mapping.
     * Body: { entityType, entityId, term, languageCode, confidenceWeight }
     */
    addMapping = async (req, res) => {
        try {
            const { entityType, entityId, term, languageCode, confidenceWeight } = req.body;
            if (!entityType || !entityId || !term) {
                ApiResponse.badRequest(res, "entityType, entityId, and term are required");
                return;
            }
            const mapping = await this.dictionaryService.addMapping({
                entityType,
                entityId,
                term,
                languageCode,
                confidenceWeight,
            });
            ApiResponse.created(res, mapping, "Dictionary mapping added");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    /**
     * POST /api/v1/localization/dictionary/bulk
     * Bulk add mappings. Body: { mappings: [{entityType, entityId, term, languageCode}] }
     */
    bulkAddMappings = async (req, res) => {
        try {
            const { mappings } = req.body;
            if (!Array.isArray(mappings) || mappings.length === 0) {
                ApiResponse.badRequest(res, "mappings array is required");
                return;
            }
            const results = await Promise.all(mappings.map((m) => this.dictionaryService.addMapping(m)));
            ApiResponse.ok(res, { count: results.length }, "Bulk mappings added");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    /**
     * POST /api/v1/localization/dictionary/resolve
     * Test: resolve a raw term → entity ID.
     * Body: { term, entityType? }
     */
    resolveTerm = async (req, res) => {
        try {
            const { term, entityType } = req.body;
            if (!term) {
                ApiResponse.badRequest(res, "term is required");
                return;
            }
            const entityId = await this.dictionaryService.resolveTerm(term, entityType);
            ApiResponse.ok(res, { term, entityType, resolvedEntityId: entityId, resolved: !!entityId }, "Term resolved");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

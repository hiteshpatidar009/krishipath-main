import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class LanguageController {
    languageService;
    constructor(languageService) {
        this.languageService = languageService;
    }
    listLanguages = async (req, res) => {
        try {
            const activeOnly = req.query.active === "true";
            const languages = await this.languageService.listAll(activeOnly);
            ApiResponse.ok(res, languages, "Languages fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createLanguage = async (req, res) => {
        try {
            const { code, name, nativeName, isRtl, isDefault, sortOrder } = req.body;
            if (!code || !name || !nativeName) {
                ApiResponse.badRequest(res, "code, name, and nativeName are required");
                return;
            }
            const language = await this.languageService.create({
                code, name, nativeName, isRtl, isDefault, sortOrder,
            });
            ApiResponse.created(res, language, "Language created successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateLanguage = async (req, res) => {
        try {
            const id = req.params.id;
            const updated = await this.languageService.update(id, req.body);
            ApiResponse.ok(res, updated, "Language updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

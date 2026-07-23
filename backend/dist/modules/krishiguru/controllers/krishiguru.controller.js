import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class KrishiGuruController {
    krishiGuruService;
    constructor(krishiGuruService) {
        this.krishiGuruService = krishiGuruService;
    }
    auth(req) {
        const auth = req.auth;
        if (!auth?.userId)
            throw new Error("Unauthorized");
        return { userId: auth.userId, farmerId: auth.farmerId };
    }
    history = async (req, res) => {
        try {
            const auth = this.auth(req);
            const history = await this.krishiGuruService.getHistory(auth.userId, auth.farmerId);
            ApiResponse.ok(res, history, "KrishiGuru history fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    chat = async (req, res) => {
        try {
            const auth = this.auth(req);
            const { message, language } = req.body;
            if (!message) {
                ApiResponse.badRequest(res, "Message is required");
                return;
            }
            // Default language to Hindi if not specified, but usually passed by frontend
            const targetLanguage = language || "Hindi";
            const result = await this.krishiGuruService.chat(auth.userId, auth.farmerId, message, targetLanguage);
            ApiResponse.ok(res, result, "AI chat response generated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

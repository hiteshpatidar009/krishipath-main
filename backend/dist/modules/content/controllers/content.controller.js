import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class ContentController {
    contentService;
    translationService;
    constructor(contentService, translationService) {
        this.contentService = contentService;
        this.translationService = translationService;
    }
    userId(req) {
        const userId = req.auth?.userId;
        if (!userId)
            throw new Error("Unauthorized");
        return userId;
    }
    getSchemes = async (req, res) => {
        try {
            let data = await this.contentService.getSchemes();
            const lang = req.headers["accept-language"];
            if (lang && !lang.includes("en")) {
                data = await this.translationService.resolveEntityList("content_schemes", data, ["title", "description"], lang);
            }
            ApiResponse.ok(res, data, "Schemes fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    getPredictions = async (req, res) => {
        try {
            // Express returns repeated query parameters as an array while older
            // mobile builds send a single comma-separated value. Support both
            // representations so selecting multiple crops never turns into a 400.
            const cropIdsQuery = req.query.cropIds;
            const parsedCropIds = (Array.isArray(cropIdsQuery) ? cropIdsQuery : [cropIdsQuery])
                .flatMap((value) => typeof value === "string" ? value.split(",") : [])
                .map((value) => value.trim())
                .filter(Boolean);
            let data = await this.contentService.getPredictions(parsedCropIds);
            const lang = req.headers["accept-language"];
            if (lang && !lang.includes("en")) {
                data = await this.translationService.resolveEntityList("content_predictions", data, ["notes"], lang);
            }
            ApiResponse.ok(res, data, "Predictions fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    getActivePoll = async (req, res) => {
        try {
            const district = req.query.district;
            let data = await this.contentService.getActivePoll(district, req.auth?.userId);
            if (!data) {
                ApiResponse.ok(res, null, "No active poll");
                return;
            }
            const lang = req.headers["accept-language"];
            if (lang && !lang.includes("en")) {
                const translatedPoll = await this.translationService.resolveEntity("content_polls", data, ["question"], lang);
                if (translatedPoll.options) {
                    translatedPoll.options = await this.translationService.resolveEntityList("content_poll_options", translatedPoll.options, ["text"], lang);
                }
                data = translatedPoll;
            }
            ApiResponse.ok(res, data, "Active poll fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    votePoll = async (req, res) => {
        try {
            const id = req.params.id;
            const { option } = req.body;
            const data = await this.contentService.votePoll(id, option, this.userId(req));
            ApiResponse.ok(res, data, "Vote submitted");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    getCreators = async (req, res) => {
        try {
            let data = await this.contentService.getCreators();
            const lang = req.headers["accept-language"];
            if (lang && !lang.includes("en")) {
                data = await this.translationService.resolveEntityList("content_creators", data, ["bio", "specialty"], lang);
            }
            ApiResponse.ok(res, data, "Creators fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    enrollCreator = async (req, res) => {
        try {
            ApiResponse.created(res, await this.contentService.enrollCreator(this.userId(req)), "Creator application submitted");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getCreatorDashboard = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.getCreatorDashboard(this.userId(req)), "Creator dashboard fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getShorts = async (req, res) => {
        try {
            const language = typeof req.query.lang === "string" ? req.query.lang : undefined;
            const search = typeof req.query.q === "string" ? req.query.q : undefined;
            const data = await this.contentService.getShorts(language, req.auth?.userId, search);
            ApiResponse.ok(res, data, "Shorts fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    toggleShortLike = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.toggleShortLike(req.params.id, this.userId(req)), "Short reaction updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    toggleShortSave = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.toggleShortSave(req.params.id, this.userId(req)), "Saved short updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    toggleCreatorFollow = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.toggleCreatorFollow(req.params.id, this.userId(req)), "Creator follow updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    recordShortView = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.recordShortView(req.params.id), "Short view recorded");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    recordShortShare = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.recordShortShare(req.params.id), "Short share recorded");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getShortComments = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.contentService.getShortComments(req.params.id), "Short comments fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createShortComment = async (req, res) => {
        try {
            const data = await this.contentService.createShortComment(req.params.id, this.userId(req), req.body?.body);
            ApiResponse.created(res, data, "Comment published");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class ContentAdminController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    // ── Schemes ───────────────────────────────────────────────────────────
    getSchemes = async (req, res) => {
        try {
            const data = await this.contentService.getAllSchemesAdmin();
            ApiResponse.ok(res, data, "Schemes fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    createScheme = async (req, res) => {
        try {
            const data = await this.contentService.createScheme(req.body);
            ApiResponse.created(res, data, "Scheme created");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    updateScheme = async (req, res) => {
        try {
            const data = await this.contentService.updateScheme(req.params.id, req.body);
            ApiResponse.ok(res, data, "Scheme updated");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    deleteScheme = async (req, res) => {
        try {
            await this.contentService.deleteScheme(req.params.id);
            ApiResponse.ok(res, null, "Scheme deleted");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    // ── Predictions ────────────────────────────────────────────────────────
    getPredictions = async (req, res) => {
        try {
            const data = await this.contentService.getAllPredictionsAdmin();
            ApiResponse.ok(res, data, "Predictions fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    createPrediction = async (req, res) => {
        try {
            const data = await this.contentService.createPrediction(req.body);
            ApiResponse.created(res, data, "Prediction created");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    updatePrediction = async (req, res) => {
        try {
            const data = await this.contentService.updatePrediction(req.params.id, req.body);
            ApiResponse.ok(res, data, "Prediction updated");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    deletePrediction = async (req, res) => {
        try {
            await this.contentService.deletePrediction(req.params.id);
            ApiResponse.ok(res, null, "Prediction deleted");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    // ── Polls ─────────────────────────────────────────────────────────────
    getPolls = async (req, res) => {
        try {
            const data = await this.contentService.getAllPollsAdmin();
            ApiResponse.ok(res, data, "Polls fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    createPoll = async (req, res) => {
        try {
            const { question, region, options } = req.body;
            const data = await this.contentService.createPoll({ question, region }, options || []);
            ApiResponse.created(res, data, "Poll created");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    deletePoll = async (req, res) => {
        try {
            await this.contentService.deletePoll(req.params.id);
            ApiResponse.ok(res, null, "Poll deleted");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    // ── Creators ──────────────────────────────────────────────────────────
    getCreators = async (req, res) => {
        try {
            const data = await this.contentService.getAllCreatorsAdmin();
            ApiResponse.ok(res, data, "Creators fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    createCreator = async (req, res) => {
        try {
            const data = await this.contentService.createCreator(req.body);
            ApiResponse.created(res, data, "Creator created");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    updateCreator = async (req, res) => {
        try {
            const data = await this.contentService.updateCreator(req.params.id, req.body);
            ApiResponse.ok(res, data, "Creator updated");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    deleteCreator = async (req, res) => {
        try {
            await this.contentService.deleteCreator(req.params.id);
            ApiResponse.ok(res, null, "Creator deleted");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    // ── Shorts ────────────────────────────────────────────────────────────
    getShorts = async (req, res) => {
        try {
            const data = await this.contentService.getAllShortsAdmin();
            ApiResponse.ok(res, data, "Shorts fetched");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    createShort = async (req, res) => {
        try {
            const data = await this.contentService.createShort(req.body);
            ApiResponse.created(res, data, "Short created");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    updateShort = async (req, res) => {
        try {
            const data = await this.contentService.updateShort(req.params.id, req.body);
            ApiResponse.ok(res, data, "Short updated");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
    deleteShort = async (req, res) => {
        try {
            await this.contentService.deleteShort(req.params.id);
            ApiResponse.ok(res, null, "Short deleted");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
}

import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class MarketInsightController {
    marketInsightService;
    constructor(marketInsightService) {
        this.marketInsightService = marketInsightService;
    }
    getInsight = async (req, res) => {
        try {
            const { productId, mandiId } = req.query;
            if (!productId || typeof productId !== "string") {
                ApiResponse.badRequest(res, "productId is required");
                return;
            }
            const insight = await this.marketInsightService.getActiveInsight(productId, typeof mandiId === "string" ? mandiId : undefined);
            ApiResponse.ok(res, insight, "Market insight fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    listAdmin = async (req, res) => {
        try {
            const insights = await this.marketInsightService.listAdmin({
                productId: typeof req.query.productId === "string" ? req.query.productId : undefined,
                mandiId: typeof req.query.mandiId === "string" ? req.query.mandiId : undefined,
                status: typeof req.query.status === "string" ? req.query.status : undefined,
            });
            ApiResponse.ok(res, insights, "Market insights fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createAdmin = async (req, res) => {
        try {
            const createdBy = req.auth?.userId;
            const insight = await this.marketInsightService.createInsight(req.body, createdBy);
            ApiResponse.created(res, insight, "Market insight created");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateAdmin = async (req, res) => {
        try {
            const insight = await this.marketInsightService.updateInsight(req.params.id, req.body);
            ApiResponse.ok(res, insight, "Market insight updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

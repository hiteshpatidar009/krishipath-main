import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class RewardController {
    rewardService;
    constructor(rewardService) {
        this.rewardService = rewardService;
    }
    auth(req) {
        const auth = req.auth;
        if (!auth?.userId)
            throw new Error("Unauthorized");
        return auth;
    }
    admin(req) {
        const auth = this.auth(req);
        if (!auth.isRoot && auth.userType !== "admin") {
            const error = new Error("Admin access is required");
            error.statusCode = 403;
            throw error;
        }
        return auth;
    }
    getBalance = async (req, res) => {
        try {
            const userId = req.auth?.userId;
            if (!userId)
                throw new Error("Unauthorized");
            const balance = await this.rewardService.getBalance(userId);
            ApiResponse.ok(res, { balance }, "Wallet balance fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getSummary = async (req, res) => {
        try {
            const userId = req.auth?.userId;
            if (!userId)
                throw new Error("Unauthorized");
            const summary = await this.rewardService.getSummary(userId);
            ApiResponse.ok(res, summary, "Reward summary fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getCatalog = async (req, res) => {
        try {
            const data = await this.rewardService.getCatalog(this.auth(req).userId);
            ApiResponse.ok(res, data, "Reward catalog fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    redeem = async (req, res) => {
        try {
            const data = await this.rewardService.redeem(this.auth(req).userId, req.params.id);
            ApiResponse.created(res, data, "Reward redemption requested successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createCatalogItem = async (req, res) => {
        try {
            this.admin(req);
            ApiResponse.created(res, await this.rewardService.createCatalogItem(req.body), "Reward published successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateCatalogItem = async (req, res) => {
        try {
            this.admin(req);
            ApiResponse.ok(res, await this.rewardService.updateCatalogItem(req.params.id, req.body), "Reward updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

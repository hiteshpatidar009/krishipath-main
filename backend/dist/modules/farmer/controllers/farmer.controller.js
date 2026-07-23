import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class FarmerController {
    farmerService;
    constructor(farmerService) {
        this.farmerService = farmerService;
    }
    getProfile = async (req, res) => {
        try {
            const userId = req.auth?.userId;
            if (!userId)
                throw new Error("Unauthorized");
            const profile = await this.farmerService.getProfile(userId);
            ApiResponse.ok(res, profile, "Farmer profile fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateProfile = async (req, res) => {
        try {
            const userId = req.auth?.userId;
            if (!userId)
                throw new Error("Unauthorized");
            const profile = await this.farmerService.updateProfile(userId, req.body);
            ApiResponse.ok(res, profile, "Farmer profile updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updatePreferences = async (req, res) => {
        try {
            const userId = req.auth?.userId;
            if (!userId)
                throw new Error("Unauthorized");
            const { mandiIds, productIds } = req.body;
            const profile = await this.farmerService.updatePreferences(userId, mandiIds, productIds);
            ApiResponse.ok(res, profile, "Preferences updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getNotificationPreferences = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.farmerService.getNotificationPreferences(this.userId(req)), "Notification preferences fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateNotificationPreferences = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.farmerService.updateNotificationPreferences(this.userId(req), req.body || {}), "Notification preferences updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    userId(req) {
        const userId = req.auth?.userId;
        if (!userId)
            throw new Error("Unauthorized");
        return userId;
    }
    getCalendar = async (req, res) => {
        try {
            const data = await this.farmerService.getCalendar(this.userId(req), Number(req.query.year), Number(req.query.month));
            ApiResponse.ok(res, data, "Farm calendar fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getMarketWatchlist = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.farmerService.getMarketWatchlist(this.userId(req)), "Market watchlist fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    saveMarketWatch = async (req, res) => {
        try {
            const data = await this.farmerService.saveMarketWatch(this.userId(req), req.body?.mandiId, req.body?.productId);
            ApiResponse.created(res, data, "Market item saved");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    removeMarketWatch = async (req, res) => {
        try {
            const data = await this.farmerService.removeMarketWatch(this.userId(req), req.params.mandiId, req.params.productId);
            ApiResponse.ok(res, data, "Market item removed");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createCalendarEvent = async (req, res) => {
        try {
            const data = await this.farmerService.createCalendarEvent(this.userId(req), req.body);
            ApiResponse.created(res, data, "Calendar event created");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getTasks = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.farmerService.getTasks(this.userId(req)), "Farmer tasks fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createTask = async (req, res) => {
        try {
            ApiResponse.created(res, await this.farmerService.createTask(this.userId(req), req.body), "Farmer task created");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    completeTask = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.farmerService.completeTask(this.userId(req), req.params.id), "Task completed");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}

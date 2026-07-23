import { Router } from "express";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";
export class FarmerRoutes {
    farmerController;
    router = Router();
    constructor(farmerController) {
        this.farmerController = farmerController;
        this.setupRoutes();
    }
    setupRoutes() {
        // Farmer profile, calendar and tasks are user-specific. Besides protecting
        // the data, this middleware attaches req.auth which every controller below
        // relies on to resolve the current farmer.
        this.router.use(AuthMiddleware.ensureAuthenticated);
        this.router.get("/profile", this.farmerController.getProfile);
        this.router.put("/profile", this.farmerController.updateProfile);
        this.router.put("/preferences", this.farmerController.updatePreferences);
        this.router.get("/notification-preferences", this.farmerController.getNotificationPreferences);
        this.router.put("/notification-preferences", this.farmerController.updateNotificationPreferences);
        this.router.get("/market-watchlist", this.farmerController.getMarketWatchlist);
        this.router.post("/market-watchlist", this.farmerController.saveMarketWatch);
        this.router.delete("/market-watchlist/:mandiId/:productId", this.farmerController.removeMarketWatch);
        this.router.get("/calendar", this.farmerController.getCalendar);
        this.router.post("/calendar", this.farmerController.createCalendarEvent);
        this.router.get("/tasks", this.farmerController.getTasks);
        this.router.post("/tasks", this.farmerController.createTask);
        this.router.patch("/tasks/:id/complete", this.farmerController.completeTask);
    }
    getRouter() {
        return this.router;
    }
}

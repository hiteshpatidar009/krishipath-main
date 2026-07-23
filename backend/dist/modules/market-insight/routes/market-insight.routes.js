import { Router } from "express";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";
export class MarketInsightRoutes {
    marketInsightController;
    router = Router();
    constructor(marketInsightController) {
        this.marketInsightController = marketInsightController;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get("/", this.marketInsightController.getInsight);
        this.router.use("/admin", AuthMiddleware.ensureAuthenticated);
        this.router.use("/admin", (req, res, next) => {
            const auth = req.auth;
            if (!auth?.isRoot && auth?.userType !== "admin") {
                res.status(403).json({ success: false, message: "Admin access is required" });
                return;
            }
            next();
        });
        this.router.get("/admin", this.marketInsightController.listAdmin);
        this.router.post("/admin", this.marketInsightController.createAdmin);
        this.router.patch("/admin/:id", this.marketInsightController.updateAdmin);
    }
    getRouter() {
        return this.router;
    }
}

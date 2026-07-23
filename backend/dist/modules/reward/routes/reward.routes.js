import { Router } from "express";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";
export class RewardRoutes {
    rewardController;
    router = Router();
    constructor(rewardController) {
        this.rewardController = rewardController;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.use(AuthMiddleware.ensureAuthenticated);
        this.router.get("/balance", this.rewardController.getBalance);
        this.router.get("/summary", this.rewardController.getSummary);
        this.router.get("/catalog", this.rewardController.getCatalog);
        this.router.post("/catalog", this.rewardController.createCatalogItem);
        this.router.patch("/catalog/:id", this.rewardController.updateCatalogItem);
        this.router.post("/redeem/:id", this.rewardController.redeem);
    }
    getRouter() {
        return this.router;
    }
}

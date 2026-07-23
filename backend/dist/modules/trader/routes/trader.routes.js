import { Router } from "express";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";
export class TraderRoutes {
    traderController;
    router = Router();
    constructor(traderController) {
        this.traderController = traderController;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.use(AuthMiddleware.ensureAuthenticated);
        this.router.get("/profile", this.traderController.getProfile);
        this.router.post("/prices", this.traderController.updatePrices);
    }
    getRouter() {
        return this.router;
    }
}

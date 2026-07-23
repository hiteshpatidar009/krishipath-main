import { Router } from "express";
import { TraderController } from "../controllers/trader.controller";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";

export class TraderRoutes {
  private readonly router = Router();

  constructor(private readonly traderController: TraderController) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(AuthMiddleware.ensureAuthenticated);
    this.router.get("/profile", this.traderController.getProfile);
    this.router.post("/prices", this.traderController.updatePrices);
  }

  public getRouter(): Router {
    return this.router;
  }
}

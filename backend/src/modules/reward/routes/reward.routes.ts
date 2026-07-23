import { Router } from "express";
import { RewardController } from "../controllers/reward.controller";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";

export class RewardRoutes {
  private readonly router = Router();

  constructor(private readonly rewardController: RewardController) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(AuthMiddleware.ensureAuthenticated);
    this.router.get("/balance", this.rewardController.getBalance);
    this.router.get("/summary", this.rewardController.getSummary);
    this.router.get("/catalog", this.rewardController.getCatalog);
    this.router.post("/catalog", this.rewardController.createCatalogItem);
    this.router.patch("/catalog/:id", this.rewardController.updateCatalogItem);
    this.router.post("/redeem/:id", this.rewardController.redeem);
  }

  public getRouter(): Router {
    return this.router;
  }
}

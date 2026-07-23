import { NextFunction, Request, Response, Router } from "express";
import { MarketInsightController } from "../controllers/market-insight.controller";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";

export class MarketInsightRoutes {
  private readonly router = Router();

  constructor(private readonly marketInsightController: MarketInsightController) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/", this.marketInsightController.getInsight);
    this.router.use("/admin", AuthMiddleware.ensureAuthenticated);
    this.router.use("/admin", (req: Request, res: Response, next: NextFunction) => {
      const auth = (req as any).auth;
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

  public getRouter(): Router {
    return this.router;
  }
}

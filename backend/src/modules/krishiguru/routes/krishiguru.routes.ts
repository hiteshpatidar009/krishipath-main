import { Router } from "express";
import { KrishiGuruController } from "../controllers/krishiguru.controller";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";

export class KrishiGuruRoutes {
  private readonly router = Router();

  constructor(private readonly krishiGuruController: KrishiGuruController) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(AuthMiddleware.ensureAuthenticated);
    this.router.get("/history", this.krishiGuruController.history);
    this.router.post("/chat", this.krishiGuruController.chat);
  }

  public getRouter(): Router {
    return this.router;
  }
}

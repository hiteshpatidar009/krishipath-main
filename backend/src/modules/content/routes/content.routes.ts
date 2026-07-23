import { NextFunction, Request, Response, Router } from "express";
import { ContentController } from "../controllers/content.controller";
import { ContentAdminController } from "../controllers/content-admin.controller";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";

export class ContentRoutes {
  private readonly router = Router();
  private readonly adminRouter = Router();

  constructor(
    private readonly contentController: ContentController,
    private readonly contentAdminController: ContentAdminController
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // ── Public Routes (Mobile App) ──────────────────────────────────────
    this.router.get("/schemes", this.contentController.getSchemes);
    this.router.get("/predictions", this.contentController.getPredictions);
    this.router.get("/poll/active", AuthMiddleware.attachOptional, this.contentController.getActivePoll);
    this.router.post("/poll/:id/vote", AuthMiddleware.ensureAuthenticated, this.contentController.votePoll);
    this.router.get("/creators", this.contentController.getCreators);
    this.router.post("/creators/enroll", AuthMiddleware.ensureAuthenticated, this.contentController.enrollCreator);
    this.router.get("/creator/dashboard", AuthMiddleware.ensureAuthenticated, this.contentController.getCreatorDashboard);
    this.router.get("/shorts", AuthMiddleware.attachOptional, this.contentController.getShorts);
    this.router.post("/shorts/:id/view", this.contentController.recordShortView);
    this.router.post("/shorts/:id/share", this.contentController.recordShortShare);
    this.router.get("/shorts/:id/comments", this.contentController.getShortComments);
    this.router.post("/shorts/:id/comments", AuthMiddleware.ensureAuthenticated, this.contentController.createShortComment);
    this.router.post("/shorts/:id/like", AuthMiddleware.ensureAuthenticated, this.contentController.toggleShortLike);
    this.router.post("/shorts/:id/save", AuthMiddleware.ensureAuthenticated, this.contentController.toggleShortSave);
    this.router.post("/creators/:id/follow", AuthMiddleware.ensureAuthenticated, this.contentController.toggleCreatorFollow);

    // ── Admin Routes ────────────────────────────────────────────────────
    this.adminRouter.use(AuthMiddleware.ensureAuthenticated);
    this.adminRouter.use((req: Request, res: Response, next: NextFunction) => {
      const auth = (req as any).auth;
      if (!auth?.isRoot && auth?.userType !== "admin") {
        res.status(403).json({ success: false, message: "Admin access is required" });
        return;
      }
      next();
    });
    this.adminRouter.get("/schemes", this.contentAdminController.getSchemes);
    this.adminRouter.post("/schemes", this.contentAdminController.createScheme);
    this.adminRouter.put("/schemes/:id", this.contentAdminController.updateScheme);
    this.adminRouter.delete("/schemes/:id", this.contentAdminController.deleteScheme);

    this.adminRouter.get("/predictions", this.contentAdminController.getPredictions);
    this.adminRouter.post("/predictions", this.contentAdminController.createPrediction);
    this.adminRouter.put("/predictions/:id", this.contentAdminController.updatePrediction);
    this.adminRouter.delete("/predictions/:id", this.contentAdminController.deletePrediction);

    this.adminRouter.get("/polls", this.contentAdminController.getPolls);
    this.adminRouter.post("/polls", this.contentAdminController.createPoll);
    this.adminRouter.delete("/polls/:id", this.contentAdminController.deletePoll);

    this.adminRouter.get("/creators", this.contentAdminController.getCreators);
    this.adminRouter.post("/creators", this.contentAdminController.createCreator);
    this.adminRouter.put("/creators/:id", this.contentAdminController.updateCreator);
    this.adminRouter.delete("/creators/:id", this.contentAdminController.deleteCreator);

    this.adminRouter.get("/shorts", this.contentAdminController.getShorts);
    this.adminRouter.post("/shorts", this.contentAdminController.createShort);
    this.adminRouter.put("/shorts/:id", this.contentAdminController.updateShort);
    this.adminRouter.delete("/shorts/:id", this.contentAdminController.deleteShort);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getAdminRouter(): Router {
    return this.adminRouter;
  }
}

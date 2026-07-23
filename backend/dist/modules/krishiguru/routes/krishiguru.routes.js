import { Router } from "express";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";
export class KrishiGuruRoutes {
    krishiGuruController;
    router = Router();
    constructor(krishiGuruController) {
        this.krishiGuruController = krishiGuruController;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.use(AuthMiddleware.ensureAuthenticated);
        this.router.get("/history", this.krishiGuruController.history);
        this.router.post("/chat", this.krishiGuruController.chat);
    }
    getRouter() {
        return this.router;
    }
}

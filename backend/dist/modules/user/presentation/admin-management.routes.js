import { Router } from "express";
import { AdminManagementController } from "./admin-management.controller";
export class AdminManagementRoutes {
    router = Router();
    controller = new AdminManagementController();
    constructor() {
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get("/list", this.controller.list);
        this.router.get("/farmers", this.controller.listFarmers);
        this.router.post("/create", this.controller.create);
        this.router.patch("/:id", this.controller.update);
        this.router.delete("/:id", this.controller.deactivate);
    }
    getRouter() {
        return this.router;
    }
}

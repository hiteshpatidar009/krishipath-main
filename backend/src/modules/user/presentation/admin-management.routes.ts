import { Router } from "express";
import { AdminManagementController } from "./admin-management.controller";

export class AdminManagementRoutes {
  private readonly router = Router();
  private readonly controller = new AdminManagementController();

  constructor() {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/list", this.controller.list);
    this.router.get("/farmers", this.controller.listFarmers);
    this.router.post("/create", this.controller.create);
    this.router.patch("/:id", this.controller.update);
    this.router.delete("/:id", this.controller.deactivate);
  }

  public getRouter(): Router {
    return this.router;
  }
}

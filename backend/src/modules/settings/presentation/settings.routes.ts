import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
import { SettingsController } from "./settings.controller";

export class SettingsRoutes {
  private readonly router = Router();

  public constructor(private readonly controller: SettingsController) {
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
    this.router.get("/", AuthorizationMiddleware.requirePermissions("settings.read"), this.controller.resolve);
    this.router.patch("/", AuthorizationMiddleware.requirePermissions("settings.update"), IdempotencyMiddleware.requireForMutations(), this.controller.update);
    this.router.post("/features", AuthorizationMiddleware.requirePermissions("settings.update"), IdempotencyMiddleware.requireForMutations(), this.controller.feature);
  }
}

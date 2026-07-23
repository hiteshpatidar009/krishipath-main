import { Router } from "express";
import { SettingsService } from "./application/settings.service";
import { SettingsRepository } from "./infrastructure/settings.repository";
import { SettingsController } from "./presentation/settings.controller";
import { SettingsRoutes } from "./presentation/settings.routes";

export class SettingsModule {
  private readonly repo = new SettingsRepository();
  private readonly service = new SettingsService(this.repo);
  private readonly controller = new SettingsController(this.service);
  private readonly routes = new SettingsRoutes(this.controller);

  public getRouter(): Router {
    return this.routes.getRouter();
  }
}

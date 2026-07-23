import { SettingsService } from "./application/settings.service";
import { SettingsRepository } from "./infrastructure/settings.repository";
import { SettingsController } from "./presentation/settings.controller";
import { SettingsRoutes } from "./presentation/settings.routes";
export class SettingsModule {
    repo = new SettingsRepository();
    service = new SettingsService(this.repo);
    controller = new SettingsController(this.service);
    routes = new SettingsRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

import { DashboardService } from "./application/dashboard.service";
import { DashboardRepository } from "./infrastructure/dashboard.repository";
import { DashboardController } from "./presentation/dashboard.controller";
import { DashboardRoutes } from "./presentation/dashboard.routes";
export class DashboardModule {
    routes = new DashboardRoutes(new DashboardController(new DashboardService(new DashboardRepository())));
    getRouter() {
        return this.routes.getRouter();
    }
}

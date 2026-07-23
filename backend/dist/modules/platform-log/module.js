import { PlatformLogController } from "./controllers/platform-log.controller";
import { PlatformLogRoutes } from "./routes/platform-log.routes";
import { PlatformLogService } from "./services/platform-log.service";
export class PlatformLogModule {
    service = new PlatformLogService();
    controller = new PlatformLogController(this.service);
    routes = new PlatformLogRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

import { ApiKeyService } from "./application/api-key.service";
import { ApiKeyRepository } from "./infrastructure/api-key.repository";
import { ApiKeyController } from "./presentation/api-key.controller";
import { ApiKeyRoutes } from "./presentation/api-key.routes";
export class ApiKeyModule {
    repo = new ApiKeyRepository();
    service = new ApiKeyService(this.repo);
    controller = new ApiKeyController(this.service);
    routes = new ApiKeyRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

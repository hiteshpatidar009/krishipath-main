import { UserService } from "./application/user.service";
import { UserRepository } from "./infrastructure/user.repository";
import { UserController } from "./presentation/user.controller";
import { UserRoutes } from "./presentation/user.routes";
export class UserModule {
    repo = new UserRepository();
    service = new UserService(this.repo);
    controller = new UserController(this.service);
    routes = new UserRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

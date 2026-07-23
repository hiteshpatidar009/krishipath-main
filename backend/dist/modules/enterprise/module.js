import { EnterpriseController } from "./controllers/enterprise.controller";
import { PostgresEnterpriseRepository } from "./repositories/postgres-enterprise.repository";
import { EnterpriseRoutes } from "./routes/enterprise.routes";
import { EnterpriseService } from "./services/enterprise.service";
export class EnterpriseModule {
    repository = new PostgresEnterpriseRepository();
    service = new EnterpriseService(this.repository);
    controller = new EnterpriseController(this.service);
    routes = new EnterpriseRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

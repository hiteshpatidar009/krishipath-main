import { QualityManagementController } from "./controllers/quality-management.controller";
import { PostgresQualityManagementRepository } from "./repositories/postgres-quality-management.repository";
import { QualityManagementRoutes } from "./routes/quality-management.routes";
import { QualityManagementService } from "./services/quality-management.service";
export class QualityManagementModule {
    repository = new PostgresQualityManagementRepository();
    service = new QualityManagementService(this.repository);
    controller = new QualityManagementController(this.service);
    routes = new QualityManagementRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

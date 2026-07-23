import { FinanceAccountingController } from "./controllers/finance-accounting.controller";
import { PostgresFinanceAccountingRepository } from "./repositories/postgres-finance-accounting.repository";
import { FinanceAccountingRoutes } from "./routes/finance-accounting.routes";
import { FinanceAccountingService } from "./services/finance-accounting.service";
export class FinanceAccountingModule {
    repository = new PostgresFinanceAccountingRepository();
    service = new FinanceAccountingService(this.repository);
    controller = new FinanceAccountingController(this.service);
    routes = new FinanceAccountingRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

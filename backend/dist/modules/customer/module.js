import { CustomerController } from "./controllers/customer.controller";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerRoutes } from "./routes/customer.routes";
import { CustomerIntegrationService } from "./services/customer-integration.service";
import { CustomerService } from "./services/customer.service";
export class CustomerModule {
    repository = new CustomerRepository();
    integrations = new CustomerIntegrationService();
    service = new CustomerService(this.repository, this.integrations);
    controller = new CustomerController(this.service);
    routes = new CustomerRoutes(this.controller);
    getRouter() {
        return this.routes.getCustomerRouter();
    }
    getCustomerGroupsRouter() {
        return this.routes.getCustomerGroupsRouter();
    }
}

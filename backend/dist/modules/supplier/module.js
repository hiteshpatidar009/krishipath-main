import { SupplierController } from "./controllers/supplier.controller";
import { SupplierRepository } from "./infrastructure/repositories/postgres-supplier.repository";
import { SupplierRoutes } from "./routes/supplier.routes";
import { SuppliersService } from "./application/suppliers.service";
export class SupplierModule {
    repository = new SupplierRepository();
    service = new SuppliersService(this.repository);
    controller = new SupplierController(this.service);
    routes = new SupplierRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}

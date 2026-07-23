import { GetInventoryAvailabilityUseCase, GetInventoryBalanceUseCase, ListInventoryBalancesUseCase, ListInventoryMovementsUseCase, ReceiveInventoryUseCase, GetInventoryOverviewUseCase, GetBalancesByLocationUseCase, GetLocationKpisUseCase, GetAgingReportUseCase, GetAgingDetailsUseCase, ExportInventoryBalancesUseCase, ExportBalancesByLocationUseCase, GetStockAlertsUseCase, } from "./application";
import { InventoryContractAdapter } from "./contracts";
import { PostgresInventoryRepository } from "./infrastructure/postgres-inventory.repository";
import { InventoryController } from "./presentation/inventory.controller";
import { InventoryRoutes } from "./presentation/inventory.routes";
export class InventoryModule {
    repository = new PostgresInventoryRepository();
    receiveUseCase = new ReceiveInventoryUseCase(this.repository);
    controller = new InventoryController(this.receiveUseCase, new ListInventoryBalancesUseCase(this.repository), new GetInventoryBalanceUseCase(this.repository), new GetInventoryAvailabilityUseCase(this.repository), new ListInventoryMovementsUseCase(this.repository), new GetInventoryOverviewUseCase(this.repository), new GetBalancesByLocationUseCase(this.repository), new GetLocationKpisUseCase(this.repository), new GetAgingReportUseCase(this.repository), new GetAgingDetailsUseCase(this.repository), new ExportInventoryBalancesUseCase(this.repository), new ExportBalancesByLocationUseCase(this.repository), new GetStockAlertsUseCase(this.repository));
    routes = new InventoryRoutes(this.controller);
    contract = new InventoryContractAdapter(this.receiveUseCase);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}

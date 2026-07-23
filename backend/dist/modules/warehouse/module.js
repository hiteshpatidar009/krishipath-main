import { CreateWarehouseUseCase, DeleteWarehouseUseCase, GetWarehouseUseCase, GetWarehouseDashboardUseCase, GetWarehouseDetailsUseCase, GetWarehouseSummaryUseCase, GetWarehouseConfigurationUseCase, UpdateWarehouseConfigurationUseCase, WarehouseStaffUseCases, ListWarehousesUseCase, SetDefaultWarehouseUseCase, UpdateWarehouseUseCase, WarehouseZoneUseCases, WarehouseBinUseCases, WarehousePutawayUseCases, WarehouseTaskBoardUseCases, WarehousePickWaveUseCases, WarehousePickListUseCases, WarehousePackingWorkbenchUseCases, } from "./application";
import { PostgresWarehouseRepository } from "./infrastructure/repositories/postgres-warehouse.repository";
import { WarehouseController } from "./presentation/controllers/warehouse.controller";
import { WarehouseRoutes } from "./presentation/routes/warehouse.routes";
export class WarehouseModule {
    repository = new PostgresWarehouseRepository();
    controller = new WarehouseController(new CreateWarehouseUseCase(this.repository), new ListWarehousesUseCase(this.repository), new GetWarehouseUseCase(this.repository), new UpdateWarehouseUseCase(this.repository), new DeleteWarehouseUseCase(this.repository), new SetDefaultWarehouseUseCase(this.repository), new GetWarehouseDashboardUseCase(this.repository), new GetWarehouseDetailsUseCase(this.repository), new GetWarehouseSummaryUseCase(this.repository), new GetWarehouseConfigurationUseCase(this.repository), new UpdateWarehouseConfigurationUseCase(this.repository), new WarehouseStaffUseCases(this.repository), new WarehouseZoneUseCases(this.repository), new WarehouseBinUseCases(this.repository), new WarehousePutawayUseCases(this.repository), new WarehouseTaskBoardUseCases(this.repository), new WarehousePickWaveUseCases(this.repository), new WarehousePickListUseCases(this.repository), new WarehousePackingWorkbenchUseCases(this.repository));
    routes = new WarehouseRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
    getPackingWorkbenchRouter() {
        return this.routes.getPackingWorkbenchRouter();
    }
}

import { AllocateReservationUseCase, CreateReservationUseCase, ExpireReservationsUseCase, FulfillReservationUseCase, ListReservationsUseCase, ReleaseReservationUseCase, GetReservationSummaryUseCase, GetReservationActivitiesUseCase, GetReservationDetailsUseCase, } from "./application";
import { StockReservationContractAdapter } from "./contracts";
import { PostgresStockReservationRepository } from "./infrastructure/postgres-stock-reservation.repository";
import { StockReservationController } from "./presentation/stock-reservation.controller";
import { StockReservationRoutes } from "./presentation/stock-reservation.routes";
export class StockReservationModule {
    repository = new PostgresStockReservationRepository();
    createUseCase = new CreateReservationUseCase(this.repository);
    releaseUseCase = new ReleaseReservationUseCase(this.repository);
    controller = new StockReservationController(this.createUseCase, this.releaseUseCase, new AllocateReservationUseCase(this.repository), new FulfillReservationUseCase(this.repository), new ExpireReservationsUseCase(this.repository), new ListReservationsUseCase(this.repository), new GetReservationSummaryUseCase(this.repository), new GetReservationActivitiesUseCase(this.repository), new GetReservationDetailsUseCase(this.repository));
    routes = new StockReservationRoutes(this.controller);
    contract = new StockReservationContractAdapter(this.createUseCase, this.releaseUseCase);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}

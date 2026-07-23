import { CreateStockTransferUseCase, UpdateStockTransferUseCase, GetStockTransferUseCase, ListStockTransfersUseCase, TransitionStockTransferUseCase, PreCheckStockTransferUseCase, GetRecentStockTransfersUseCase, GetNextTransferNumberUseCase, SubmitStockTransferUseCase, DecideStockTransferUseCase, ReceiveStockTransferUseCase, AddStockTransferAttachmentUseCase, DeleteStockTransferAttachmentUseCase, GetStockTransferAttachmentsUseCase, GetStockTransferTimelineUseCase, RecalculateStockTransferRouteUseCase, GetStockTransferRiskAssessmentUseCase, } from "./application";
import { StockTransferContractAdapter } from "./contracts";
import { PostgresStockTransferRepository } from "./infrastructure/postgres-stock-transfer.repository";
import { StockTransferController } from "./presentation/stock-transfer.controller";
import { StockTransferRoutes } from "./presentation/stock-transfer.routes";
export class StockTransferModule {
    repository = new PostgresStockTransferRepository();
    createUseCase = new CreateStockTransferUseCase(this.repository);
    updateUseCase = new UpdateStockTransferUseCase(this.repository);
    transitionUseCase = new TransitionStockTransferUseCase(this.repository);
    listUseCase = new ListStockTransfersUseCase(this.repository);
    getUseCase = new GetStockTransferUseCase(this.repository);
    preCheckUseCase = new PreCheckStockTransferUseCase(this.repository);
    recentUseCase = new GetRecentStockTransfersUseCase(this.repository);
    nextNumberUseCase = new GetNextTransferNumberUseCase(this.repository);
    submitUseCase = new SubmitStockTransferUseCase(this.repository);
    decideUseCase = new DecideStockTransferUseCase(this.repository);
    receiveUseCase = new ReceiveStockTransferUseCase(this.repository);
    addAttachmentUseCase = new AddStockTransferAttachmentUseCase(this.repository);
    deleteAttachmentUseCase = new DeleteStockTransferAttachmentUseCase(this.repository);
    getAttachmentsUseCase = new GetStockTransferAttachmentsUseCase(this.repository);
    getTimelineUseCase = new GetStockTransferTimelineUseCase(this.repository);
    recalculateRouteUseCase = new RecalculateStockTransferRouteUseCase(this.repository);
    getRiskAssessmentUseCase = new GetStockTransferRiskAssessmentUseCase(this.repository);
    controller = new StockTransferController(this.createUseCase, this.updateUseCase, this.transitionUseCase, this.listUseCase, this.getUseCase, this.preCheckUseCase, this.recentUseCase, this.nextNumberUseCase, this.submitUseCase, this.decideUseCase, this.receiveUseCase, this.addAttachmentUseCase, this.deleteAttachmentUseCase, this.getAttachmentsUseCase, this.getTimelineUseCase, this.recalculateRouteUseCase, this.getRiskAssessmentUseCase);
    routes = new StockTransferRoutes(this.controller);
    contract = new StockTransferContractAdapter(this.createUseCase, this.transitionUseCase);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}

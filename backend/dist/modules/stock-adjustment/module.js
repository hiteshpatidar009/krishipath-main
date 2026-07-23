import { WorkflowApprovalModule } from "../workflow-approval/module";
import { ApproveStockAdjustmentUseCase, CreateStockAdjustmentUseCase, ListStockAdjustmentsUseCase, RejectStockAdjustmentUseCase, GetStockAdjustmentUseCase, UpdateStockAdjustmentUseCase, SubmitStockAdjustmentUseCase, CancelStockAdjustmentUseCase, RequestChangesStockAdjustmentUseCase, ReassignStockAdjustmentUseCase, AddCommentStockAdjustmentUseCase, AddAttachmentStockAdjustmentUseCase, } from "./application";
import { StockAdjustmentContractAdapter } from "./contracts";
import { PostgresStockAdjustmentRepository } from "./infrastructure/postgres-stock-adjustment.repository";
import { StockAdjustmentController } from "./presentation/stock-adjustment.controller";
import { StockAdjustmentRoutes } from "./presentation/stock-adjustment.routes";
export class StockAdjustmentModule {
    repository = new PostgresStockAdjustmentRepository();
    workflowContract = new WorkflowApprovalModule().getContract();
    createUseCase = new CreateStockAdjustmentUseCase(this.repository, this.workflowContract);
    approveUseCase = new ApproveStockAdjustmentUseCase(this.repository);
    rejectUseCase = new RejectStockAdjustmentUseCase(this.repository);
    listUseCase = new ListStockAdjustmentsUseCase(this.repository);
    getUseCase = new GetStockAdjustmentUseCase(this.repository);
    updateUseCase = new UpdateStockAdjustmentUseCase(this.repository, this.workflowContract);
    submitUseCase = new SubmitStockAdjustmentUseCase(this.repository, this.workflowContract);
    cancelUseCase = new CancelStockAdjustmentUseCase(this.repository);
    requestChangesUseCase = new RequestChangesStockAdjustmentUseCase(this.repository);
    reassignUseCase = new ReassignStockAdjustmentUseCase(this.repository);
    addCommentUseCase = new AddCommentStockAdjustmentUseCase(this.repository);
    addAttachmentUseCase = new AddAttachmentStockAdjustmentUseCase(this.repository);
    controller = new StockAdjustmentController(this.createUseCase, this.approveUseCase, this.rejectUseCase, this.listUseCase, this.getUseCase, this.updateUseCase, this.submitUseCase, this.cancelUseCase, this.requestChangesUseCase, this.reassignUseCase, this.addCommentUseCase, this.addAttachmentUseCase);
    routes = new StockAdjustmentRoutes(this.controller);
    contract = new StockAdjustmentContractAdapter(this.createUseCase);
    getRouter() { return this.routes.getRouter(); }
    getContract() { return this.contract; }
}

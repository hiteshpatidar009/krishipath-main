import { WorkflowApprovalModule } from "../workflow-approval/module";
import { ApprovePurchaseOrderUseCase, CancelPurchaseOrderUseCase, CreatePurchaseOrderUseCase, CreateSupplierUseCase, GetGoodsReceiptUseCase, GetPurchaseOrderUseCase, ListGoodsReceiptsUseCase, ListPurchaseOrdersUseCase, ReceivePurchaseOrderUseCase, RejectPurchaseOrderUseCase, } from "./application";
import { PurchaseProcurementContractAdapter, } from "./contracts";
import { PostgresPurchaseProcurementRepository } from "./infrastructure/repositories/postgres-purchase-procurement.repository";
import { PurchaseProcurementController } from "./presentation/controllers/purchase-procurement.controller";
import { PurchaseProcurementRoutes } from "./presentation/routes/purchase-procurement.routes";
export class PurchaseProcurementModule {
    repository = new PostgresPurchaseProcurementRepository();
    workflowApprovalContract = new WorkflowApprovalModule().getContract();
    controller = new PurchaseProcurementController(new CreateSupplierUseCase(this.repository), new CreatePurchaseOrderUseCase(this.repository, this.workflowApprovalContract), new ListPurchaseOrdersUseCase(this.repository), new GetPurchaseOrderUseCase(this.repository), new ApprovePurchaseOrderUseCase(this.repository), new RejectPurchaseOrderUseCase(this.repository), new CancelPurchaseOrderUseCase(this.repository), new ReceivePurchaseOrderUseCase(this.repository), new ListGoodsReceiptsUseCase(this.repository), new GetGoodsReceiptUseCase(this.repository));
    routes = new PurchaseProcurementRoutes(this.controller);
    contract = new PurchaseProcurementContractAdapter(this.repository);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}

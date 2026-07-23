import { RequestContext } from "../../../../shared/context/request-context";
import { ApiResponse } from "../../../../shared/http/api-response";
import { PurchaseProcurementValidator } from "../validators/purchase-procurement.validator";
export class PurchaseProcurementController {
    createSupplierUseCase;
    createPurchaseOrderUseCase;
    listPurchaseOrdersUseCase;
    getPurchaseOrderUseCase;
    approvePurchaseOrderUseCase;
    rejectPurchaseOrderUseCase;
    cancelPurchaseOrderUseCase;
    receivePurchaseOrderUseCase;
    listGoodsReceiptsUseCase;
    getGoodsReceiptUseCase;
    constructor(createSupplierUseCase, createPurchaseOrderUseCase, listPurchaseOrdersUseCase, getPurchaseOrderUseCase, approvePurchaseOrderUseCase, rejectPurchaseOrderUseCase, cancelPurchaseOrderUseCase, receivePurchaseOrderUseCase, listGoodsReceiptsUseCase, getGoodsReceiptUseCase) {
        this.createSupplierUseCase = createSupplierUseCase;
        this.createPurchaseOrderUseCase = createPurchaseOrderUseCase;
        this.listPurchaseOrdersUseCase = listPurchaseOrdersUseCase;
        this.getPurchaseOrderUseCase = getPurchaseOrderUseCase;
        this.approvePurchaseOrderUseCase = approvePurchaseOrderUseCase;
        this.rejectPurchaseOrderUseCase = rejectPurchaseOrderUseCase;
        this.cancelPurchaseOrderUseCase = cancelPurchaseOrderUseCase;
        this.receivePurchaseOrderUseCase = receivePurchaseOrderUseCase;
        this.listGoodsReceiptsUseCase = listGoodsReceiptsUseCase;
        this.getGoodsReceiptUseCase = getGoodsReceiptUseCase;
    }
    createSupplier = async (request, response) => {
        const input = PurchaseProcurementValidator.supplier.parse(request.body);
        ApiResponse.created(response, await this.createSupplierUseCase.execute({
            companyId: RequestContext.companyId(request),
            ...input,
        }), "Supplier created");
    };
    createPurchaseOrder = async (request, response) => {
        const input = PurchaseProcurementValidator.purchaseOrder.parse(request.body);
        ApiResponse.created(response, await this.createPurchaseOrderUseCase.execute({
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            idempotencyKey: request.header("idempotency-key"),
            ...input,
        }), "Purchase order created");
    };
    listPurchaseOrders = async (request, response) => {
        const query = PurchaseProcurementValidator.listPurchaseOrders.parse(request.query);
        ApiResponse.ok(response, await this.listPurchaseOrdersUseCase.execute({
            companyId: RequestContext.companyId(request),
            ...query,
        }), "Purchase orders loaded");
    };
    getPurchaseOrder = async (request, response) => {
        ApiResponse.ok(response, await this.getPurchaseOrderUseCase.execute(RequestContext.companyId(request), String(request.params.purchaseOrderId ?? "")), "Purchase order loaded");
    };
    approvePurchaseOrder = async (request, response) => {
        ApiResponse.ok(response, await this.approvePurchaseOrderUseCase.execute({
            companyId: RequestContext.companyId(request),
            purchaseOrderId: String(request.params.purchaseOrderId ?? ""),
            approvedBy: RequestContext.userId(request),
        }), "Purchase order approved");
    };
    rejectPurchaseOrder = async (request, response) => {
        ApiResponse.ok(response, await this.rejectPurchaseOrderUseCase.execute({
            companyId: RequestContext.companyId(request),
            purchaseOrderId: String(request.params.purchaseOrderId ?? ""),
            rejectedBy: RequestContext.userId(request),
        }), "Purchase order rejected");
    };
    cancelPurchaseOrder = async (request, response) => {
        ApiResponse.ok(response, await this.cancelPurchaseOrderUseCase.execute({
            companyId: RequestContext.companyId(request),
            purchaseOrderId: String(request.params.purchaseOrderId ?? ""),
            cancelledBy: RequestContext.userId(request),
        }), "Purchase order cancelled");
    };
    receivePurchaseOrder = async (request, response) => {
        const input = PurchaseProcurementValidator.receive.parse(request.body);
        ApiResponse.created(response, await this.receivePurchaseOrderUseCase.execute({
            companyId: RequestContext.companyId(request),
            purchaseOrderId: String(request.params.purchaseOrderId ?? ""),
            receivedBy: RequestContext.userId(request),
            ...input,
        }), "Purchase order received");
    };
    listGoodsReceipts = async (request, response) => {
        const query = PurchaseProcurementValidator.listReceipts.parse(request.query);
        ApiResponse.ok(response, await this.listGoodsReceiptsUseCase.execute({
            companyId: RequestContext.companyId(request),
            ...query,
        }), "Goods receipts loaded");
    };
    getGoodsReceipt = async (request, response) => {
        ApiResponse.ok(response, await this.getGoodsReceiptUseCase.execute(RequestContext.companyId(request), String(request.params.goodsReceiptId ?? "")), "Goods receipt loaded");
    };
}

import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../../shared/security";
import { ApprovalValidationMiddleware, AntiDuplicationMiddleware, ConcurrencyMiddleware, ProcurementAuditMiddleware, ProcurementAuthMiddleware, ProcurementScopeMiddleware, RequestIntegrityMiddleware, SupplierAccessMiddleware, TransactionBoundaryMiddleware, } from "../middlewares/procurement.middleware";
export class PurchaseProcurementRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany, ProcurementAuthMiddleware.use, ProcurementScopeMiddleware.requireCompany, ProcurementAuditMiddleware.use, RequestIntegrityMiddleware.use, TransactionBoundaryMiddleware.use);
        this.router.post("/suppliers", SupplierAccessMiddleware.use, AuthorizationMiddleware.requirePermissions("procurement.supplier.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createSupplier);
        this.router.post("/purchase-orders", AntiDuplicationMiddleware.use, AuthorizationMiddleware.requirePermissions("procurement.po.create"), IdempotencyMiddleware.requireForMutations(), this.controller.createPurchaseOrder);
        this.router.get("/purchase-orders", AuthorizationMiddleware.requirePermissions("procurement.po.read"), this.controller.listPurchaseOrders);
        this.router.get("/purchase-orders/:purchaseOrderId", AuthorizationMiddleware.requirePermissions("procurement.po.read"), this.controller.getPurchaseOrder);
        this.router.post("/purchase-orders/:purchaseOrderId/approve", ApprovalValidationMiddleware.use, AuthorizationMiddleware.requirePermissions("procurement.po.approve"), IdempotencyMiddleware.requireForMutations(), this.controller.approvePurchaseOrder);
        this.router.post("/purchase-orders/:purchaseOrderId/reject", ApprovalValidationMiddleware.use, AuthorizationMiddleware.requirePermissions("procurement.po.approve"), IdempotencyMiddleware.requireForMutations(), this.controller.rejectPurchaseOrder);
        this.router.post("/purchase-orders/:purchaseOrderId/cancel", AuthorizationMiddleware.requirePermissions("procurement.po.cancel"), IdempotencyMiddleware.requireForMutations(), this.controller.cancelPurchaseOrder);
        this.router.post("/purchase-orders/:purchaseOrderId/receive", ConcurrencyMiddleware.use, AuthorizationMiddleware.requirePermissions("procurement.po.receive"), IdempotencyMiddleware.requireForMutations(), this.controller.receivePurchaseOrder);
        this.router.get("/goods-receipts", AuthorizationMiddleware.requirePermissions("procurement.receiving.read"), this.controller.listGoodsReceipts);
        this.router.get("/goods-receipts/:goodsReceiptId", AuthorizationMiddleware.requirePermissions("procurement.receiving.read"), this.controller.getGoodsReceipt);
    }
}

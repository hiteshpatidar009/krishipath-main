export class PurchaseProcurementContractAdapter {
    repository;
    moduleName = "purchase-procurement";
    version = "1.0.0";
    constructor(repository) {
        this.repository = repository;
    }
    async getPurchaseOrder(companyId, purchaseOrderId) {
        const po = await this.repository.findPurchaseOrder(companyId, purchaseOrderId);
        if (!po || !po.companyId || !po.status) {
            return null;
        }
        return {
            purchaseOrderId: po.id,
            companyId: po.companyId,
            status: po.status,
        };
    }
}

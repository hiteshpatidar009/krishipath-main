export class PurchaseOrderAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (!props.companyId || !props.supplierId || !props.warehouseId) {
            throw new Error("PO ownership incomplete");
        }
        if (!props.items.length) {
            throw new Error("PO requires at least one item");
        }
        for (const item of props.items) {
            if (item.quantityOrdered <= 0 || item.unitCost < 0) {
                throw new Error("Invalid PO item quantity or cost");
            }
        }
        return new PurchaseOrderAggregate(props);
    }
    get totalAmount() {
        return this.props.items.reduce((total, item) => {
            const gross = item.quantityOrdered * item.unitCost;
            return total + gross + (item.taxAmount ?? 0) - (item.discountAmount ?? 0);
        }, 0);
    }
}

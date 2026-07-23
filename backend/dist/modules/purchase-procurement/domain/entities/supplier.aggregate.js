export class SupplierAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (!props.companyId || !props.supplierCode || !props.supplierName) {
            throw new Error("Supplier identity incomplete");
        }
        return new SupplierAggregate(props);
    }
    get id() {
        return this.props.id;
    }
}

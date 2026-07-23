export class TenantAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (!props.name.trim()) {
            throw new Error("Company name required");
        }
        if (!props.code.trim()) {
            throw new Error("Company code required");
        }
        return new TenantAggregate(props);
    }
    get id() {
        return this.props.id;
    }
    get status() {
        return this.props.status;
    }
    canOperate() {
        return this.props.status === "trial" || this.props.status === "active";
    }
}

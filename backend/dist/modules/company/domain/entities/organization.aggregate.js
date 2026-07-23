export class OrganizationAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (!props.companyId) {
            throw new Error("Company required");
        }
        if (!props.name.trim()) {
            throw new Error("Organization name required");
        }
        return new OrganizationAggregate(props);
    }
    get id() {
        return this.props.id;
    }
    get companyId() {
        return this.props.companyId;
    }
}

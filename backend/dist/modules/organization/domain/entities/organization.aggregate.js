export class OrganizationAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (!props.companyId || !props.name.trim() || !props.organizationCode.trim()) {
            throw new Error("Organization identity incomplete");
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

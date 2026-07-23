export class OrganizationMembershipAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static assign(props) {
        if (!props.companyId || !props.organizationId || !props.userId || !props.roleId) {
            throw new Error("Organization membership incomplete");
        }
        return new OrganizationMembershipAggregate(props);
    }
    get value() {
        return this.props;
    }
}

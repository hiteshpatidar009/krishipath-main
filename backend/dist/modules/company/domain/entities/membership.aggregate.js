export class MembershipAggregate {
    scope;
    constructor(scope) {
        this.scope = scope;
    }
    static assign(scope) {
        if (!scope.companyId || !scope.userId || !scope.roleId) {
            throw new Error("Company, user and role required");
        }
        return new MembershipAggregate(scope);
    }
    get value() {
        return this.scope;
    }
}

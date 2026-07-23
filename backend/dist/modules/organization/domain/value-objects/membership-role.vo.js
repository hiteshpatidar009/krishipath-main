export class MembershipRole {
    roleId;
    constructor(roleId) {
        this.roleId = roleId;
    }
    static create(roleId) {
        if (!roleId) {
            throw new Error("Role id required");
        }
        return new MembershipRole(roleId);
    }
    toString() {
        return this.roleId;
    }
}

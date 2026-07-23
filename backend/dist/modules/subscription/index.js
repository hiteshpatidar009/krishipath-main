export class SubscriptionLimitService {
    static async assertCanCreateUser(companyId) { }
    static async checkUserLimit(companyId, actorId) { }
    static async assertCanUpdate(companyId) { }
    static async assertCanCreateOrganization(companyId) { }
    static async assertCanCreateWarehouse(companyId) { }
    static async assertCanCreateCompany(input) { }
    static async checkOrganizationLimit(companyId, actorId) { }
    static async getPlanLimits(companyId) { return {}; }
}

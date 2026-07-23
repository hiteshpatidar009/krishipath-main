export class OrganizationOrchestrator {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async validateOperationalScope(scope) {
        const organization = await this.repository.findById(scope.companyId, scope.organizationId);
        if (!organization || organization.companyId !== scope.companyId) {
            return false;
        }
        return organization.status === "active";
    }
}

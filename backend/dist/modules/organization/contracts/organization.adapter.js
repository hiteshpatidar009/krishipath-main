import { AppError } from "../../../shared/errors/app.error";
export class OrganizationContractAdapter {
    repository;
    moduleName = "organization";
    version = "1.0.0";
    constructor(repository) {
        this.repository = repository;
    }
    async validateAccess(companyId, organizationId) {
        const organization = await this.repository.findById(companyId, organizationId);
        if (!organization?.companyId || !organization.status) {
            throw new AppError("Organization access denied", 403, "ORG_ACCESS_DENIED");
        }
        return {
            organizationId: organization.id,
            companyId: organization.companyId,
            status: organization.status,
        };
    }
}

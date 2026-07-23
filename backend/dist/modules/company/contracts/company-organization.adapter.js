import { AppError } from "../../../shared/errors/app.error";
export class CompanyContractAdapter {
    repository;
    moduleName = "company";
    version = "1.0.0";
    constructor(repository) {
        this.repository = repository;
    }
    async requireActiveTenant(companyId) {
        const company = await this.repository.findTenantById(companyId);
        if (!company) {
            throw new AppError("Company not found", 404, "TENANT_NOT_FOUND");
        }
        if (company.status !== "active" && company.status !== "trial") {
            throw new AppError("Company inactive", 403, "TENANT_INACTIVE");
        }
        return { companyId: company.id, status: company.status ?? "unknown" };
    }
    async assertOrganizationBelongsToTenant(companyId, organizationId) {
        const organization = await this.repository.findOrganizationById(companyId, organizationId);
        if (!organization) {
            throw new AppError("Organization not found in company", 404, "ORGANIZATION_NOT_FOUND");
        }
    }
}

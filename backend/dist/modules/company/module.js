import { AssignOrganizationAccessUseCase, AssignWarehouseAccessUseCase, ConfigureOrganizationSettingsUseCase, ConfigureTenantSettingsUseCase, CreateTenantUseCase, CreateOrganizationUseCase, GetTenantCreationAllowanceUseCase, LinkSubscriptionUseCase, ListAccessibleTenantsUseCase, SuspendTenantUseCase, UpdateTenantOnboardingUseCase, ActivateTenantUseCase, } from "./application";
import { CompanyContractAdapter, } from "./contracts";
import { PostgresCompanyRepository } from "./infrastructure/repositories/postgres-company-organization.repository";
import { CompanyController } from "./presentation/controllers/company-organization.controller";
import { TenantDirectoryRoutes } from "./presentation/routes/company-directory.routes";
import { CompanyRoutes } from "./presentation/routes/company-organization.routes";
export class CompanyModule {
    repository = new PostgresCompanyRepository();
    controller = new CompanyController(new CreateTenantUseCase(this.repository), new GetTenantCreationAllowanceUseCase(this.repository), new UpdateTenantOnboardingUseCase(this.repository), new CreateOrganizationUseCase(this.repository), new ConfigureTenantSettingsUseCase(this.repository), new ConfigureOrganizationSettingsUseCase(this.repository), new AssignOrganizationAccessUseCase(this.repository), new AssignWarehouseAccessUseCase(this.repository), new SuspendTenantUseCase(this.repository), new ActivateTenantUseCase(this.repository), new LinkSubscriptionUseCase(this.repository), new ListAccessibleTenantsUseCase(this.repository));
    routes = new CompanyRoutes(this.controller);
    tenantDirectoryRoutes = new TenantDirectoryRoutes(this.controller);
    contract = new CompanyContractAdapter(this.repository);
    getRouter() {
        return this.routes.getRouter();
    }
    getTenantDirectoryRouter() {
        return this.tenantDirectoryRoutes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}

import { ActivateOrganizationUseCase, AssignOrganizationRoleUseCase, CreateOrganizationUseCase, GetOrganizationHierarchyUseCase, InviteOrganizationMemberUseCase, LinkWarehouseToOrganizationUseCase, SuspendOrganizationUseCase, UpdateOrganizationUseCase, ValidateOrganizationAccessUseCase, } from "./application";
import { OrganizationContractAdapter } from "./contracts";
import { PostgresOrganizationRepository } from "./infrastructure/repositories/postgres-organization.repository";
import { OrganizationOrchestrator } from "./orchestration";
import { OrganizationController } from "./presentation/controllers/organization.controller";
import { OrganizationRoutes } from "./presentation/routes/organization.routes";
export class OrganizationModule {
    repository = new PostgresOrganizationRepository();
    orchestrator = new OrganizationOrchestrator(this.repository);
    controller = new OrganizationController(new CreateOrganizationUseCase(this.repository), new UpdateOrganizationUseCase(this.repository), new InviteOrganizationMemberUseCase(), new AssignOrganizationRoleUseCase(this.repository), new ActivateOrganizationUseCase(this.repository), new SuspendOrganizationUseCase(this.repository), new LinkWarehouseToOrganizationUseCase(this.repository), new ValidateOrganizationAccessUseCase(this.repository), new GetOrganizationHierarchyUseCase(this.repository));
    routes = new OrganizationRoutes(this.controller);
    contract = new OrganizationContractAdapter(this.repository);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
    getOrchestrator() {
        return this.orchestrator;
    }
}

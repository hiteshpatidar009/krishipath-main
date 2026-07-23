import { ApproveWorkflowStepUseCase, CompleteWorkflowUseCase, CreateWorkflowDefinitionUseCase, EscalateWorkflowUseCase, ExecuteWorkflowTransitionUseCase, GetApprovalRequestUseCase, GetWorkflowDefinitionUseCase, ListApprovalRequestsUseCase, ListWorkflowDefinitionsUseCase, RejectWorkflowStepUseCase, ReassignWorkflowTaskUseCase, StartWorkflowUseCase, } from "./application";
import { WorkflowApprovalContractAdapter, } from "./contracts";
import { PostgresWorkflowApprovalRepository } from "./infrastructure/repositories/postgres-workflow-approval.repository";
import { WorkflowApprovalController } from "./presentation/controllers/workflow-approval.controller";
import { WorkflowApprovalRoutes } from "./presentation/routes/workflow-approval.routes";
export class WorkflowApprovalModule {
    repository = new PostgresWorkflowApprovalRepository();
    controller = new WorkflowApprovalController(new CreateWorkflowDefinitionUseCase(this.repository), new ListWorkflowDefinitionsUseCase(this.repository), new GetWorkflowDefinitionUseCase(this.repository), new StartWorkflowUseCase(this.repository), new ListApprovalRequestsUseCase(this.repository), new GetApprovalRequestUseCase(this.repository), new ApproveWorkflowStepUseCase(this.repository), new RejectWorkflowStepUseCase(this.repository), new EscalateWorkflowUseCase(this.repository), new ReassignWorkflowTaskUseCase(this.repository), new CompleteWorkflowUseCase(this.repository), new ExecuteWorkflowTransitionUseCase(this.repository));
    routes = new WorkflowApprovalRoutes(this.controller);
    contract = new WorkflowApprovalContractAdapter(this.repository);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}

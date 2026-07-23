import { StartWorkflowUseCase } from "../application";
export class WorkflowApprovalContractAdapter {
    moduleName = "workflow-approval";
    version = "1.0.0";
    startWorkflowUseCase;
    constructor(repository) {
        this.startWorkflowUseCase = new StartWorkflowUseCase(repository);
    }
    async start(command) {
        return this.startWorkflowUseCase.execute(command);
    }
}

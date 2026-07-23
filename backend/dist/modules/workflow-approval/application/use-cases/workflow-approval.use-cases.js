import { CoreEventBus, EventEnvelopeFactory } from "../../../../core";
import { AppError } from "../../../../shared/errors/app.error";
import { WorkflowApprovalEvents } from "../../events/workflow-approval.events";
export class CreateWorkflowDefinitionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        if (!input.steps.length) {
            throw new AppError("Workflow step required", 400, "WORKFLOW_STEP_REQUIRED");
        }
        return this.repository.createDefinition(input);
    }
}
export class StartWorkflowUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.startWorkflow(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: result.approvalRequestId,
            name: WorkflowApprovalEvents.workflowStarted,
            source: "workflow-approval",
            payload: { ...input, ...result },
            metadata: { companyId: input.companyId, userId: input.requestedBy },
        }));
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${result.approvalRequestId}:task`,
            name: WorkflowApprovalEvents.approvalRequested,
            source: "workflow-approval",
            payload: { approvalRequestId: result.approvalRequestId },
            metadata: { companyId: input.companyId, userId: input.requestedBy },
        }));
        return result;
    }
}
export class ListWorkflowDefinitionsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId) {
        return this.repository.listDefinitions(companyId);
    }
}
export class GetWorkflowDefinitionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, workflowDefinitionId) {
        const definition = await this.repository.findDefinition(companyId, workflowDefinitionId);
        if (!definition) {
            throw new AppError("Workflow definition not found", 404, "WORKFLOW_DEFINITION_NOT_FOUND");
        }
        return definition;
    }
}
export class ListApprovalRequestsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        return this.repository.listApprovalRequests(input);
    }
}
export class GetApprovalRequestUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, approvalRequestId) {
        const request = await this.repository.findApprovalRequestForTenant(companyId, approvalRequestId);
        if (!request) {
            throw new AppError("Approval request not found", 404, "APPROVAL_NOT_FOUND");
        }
        return request;
    }
}
export class ApproveWorkflowStepUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const request = await this.requireRequest(input.approvalRequestId);
        const step = await this.requireStep(request.workflowDefinitionId ?? "", request.currentStepOrder ?? 1);
        await this.repository.createDecision({
            approvalRequestId: input.approvalRequestId,
            workflowStepId: step.id,
            approverUserId: input.approverUserId,
            decision: "approved",
            comments: input.comments,
        });
        const approvals = await this.repository.countApprovals(input.approvalRequestId, step.id);
        if (approvals >= (step.minimumApprovals ?? 1)) {
            const nextStep = await this.repository.findStep(request.workflowDefinitionId ?? "", (request.currentStepOrder ?? 1) + 1);
            if (!nextStep) {
                await this.repository.updateApprovalRequest(input.approvalRequestId, {
                    status: "completed",
                    completedAt: new Date(),
                });
                await this.publish(input.approvalRequestId, WorkflowApprovalEvents.workflowCompleted);
                return { status: "completed" };
            }
            await this.repository.updateApprovalRequest(input.approvalRequestId, {
                status: "running",
                currentStepOrder: nextStep.stepOrder ?? 1,
            });
        }
        await this.publish(input.approvalRequestId, WorkflowApprovalEvents.approvalCompleted);
        return { status: "running" };
    }
    async requireRequest(id) {
        const request = await this.repository.findApprovalRequest(id);
        if (!request) {
            throw new AppError("Approval request not found", 404, "APPROVAL_NOT_FOUND");
        }
        return request;
    }
    async requireStep(definitionId, stepOrder) {
        const step = await this.repository.findStep(definitionId, stepOrder);
        if (!step) {
            throw new AppError("Workflow step not found", 404, "WORKFLOW_STEP_NOT_FOUND");
        }
        return step;
    }
    async publish(id, name) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${id}:${name}`,
            name,
            source: "workflow-approval",
            payload: { approvalRequestId: id },
            metadata: {},
        }));
    }
}
export class RejectWorkflowStepUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const request = await this.repository.findApprovalRequest(input.approvalRequestId);
        if (!request) {
            throw new AppError("Approval request not found", 404, "APPROVAL_NOT_FOUND");
        }
        const step = await this.repository.findStep(request.workflowDefinitionId ?? "", request.currentStepOrder ?? 1);
        if (!step) {
            throw new AppError("Workflow step not found", 404, "WORKFLOW_STEP_NOT_FOUND");
        }
        await this.repository.createDecision({
            approvalRequestId: input.approvalRequestId,
            workflowStepId: step.id,
            approverUserId: input.approverUserId,
            decision: "rejected",
            comments: input.comments,
        });
        await this.repository.updateApprovalRequest(input.approvalRequestId, {
            status: "rejected",
            completedAt: new Date(),
        });
        return { status: "rejected" };
    }
}
export class EscalateWorkflowUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(approvalRequestId) {
        await this.repository.updateApprovalRequest(approvalRequestId, {
            status: "escalated",
        });
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${approvalRequestId}:escalated`,
            name: WorkflowApprovalEvents.workflowEscalated,
            source: "workflow-approval",
            payload: { approvalRequestId },
            metadata: {},
        }));
        return { status: "escalated" };
    }
}
export class ReassignWorkflowTaskUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const request = await this.repository.findApprovalRequest(input.approvalRequestId);
        if (!request) {
            throw new AppError("Approval request not found", 404, "APPROVAL_NOT_FOUND");
        }
        const step = await this.repository.findStep(request.workflowDefinitionId ?? "", request.currentStepOrder ?? 1);
        if (!step) {
            throw new AppError("Workflow step not found", 404, "WORKFLOW_STEP_NOT_FOUND");
        }
        await this.repository.createDecision({
            approvalRequestId: input.approvalRequestId,
            workflowStepId: step.id,
            approverUserId: input.actorUserId,
            decision: "reassigned",
            comments: JSON.stringify({
                assigneeUserId: input.assigneeUserId,
                comments: input.comments,
            }),
        });
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.approvalRequestId}:task-reassigned:${input.assigneeUserId}`,
            name: WorkflowApprovalEvents.taskAssigned,
            source: "workflow-approval",
            payload: input,
            metadata: { userId: input.actorUserId },
        }));
        return { reassigned: true };
    }
}
export class CompleteWorkflowUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(approvalRequestId) {
        await this.repository.updateApprovalRequest(approvalRequestId, {
            status: "completed",
            completedAt: new Date(),
        });
        return { completed: true };
    }
}
export class EvaluateWorkflowConditionsUseCase {
    async execute() {
        return { passed: true };
    }
}
export class ExecuteWorkflowTransitionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(approvalRequestId, status) {
        await this.repository.updateApprovalRequest(approvalRequestId, { status });
        return { transitioned: true };
    }
}

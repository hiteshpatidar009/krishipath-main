import { RequestContext } from "../../../../shared/context/request-context";
import { ApiResponse } from "../../../../shared/http/api-response";
import { WorkflowApprovalValidator } from "../validators/workflow-approval.validator";
export class WorkflowApprovalController {
    createDefinitionUseCase;
    listWorkflowDefinitionsUseCase;
    getWorkflowDefinitionUseCase;
    startWorkflowUseCase;
    listApprovalRequestsUseCase;
    getApprovalRequestUseCase;
    approveWorkflowStepUseCase;
    rejectWorkflowStepUseCase;
    escalateWorkflowUseCase;
    reassignWorkflowTaskUseCase;
    completeWorkflowUseCase;
    executeWorkflowTransitionUseCase;
    constructor(createDefinitionUseCase, listWorkflowDefinitionsUseCase, getWorkflowDefinitionUseCase, startWorkflowUseCase, listApprovalRequestsUseCase, getApprovalRequestUseCase, approveWorkflowStepUseCase, rejectWorkflowStepUseCase, escalateWorkflowUseCase, reassignWorkflowTaskUseCase, completeWorkflowUseCase, executeWorkflowTransitionUseCase) {
        this.createDefinitionUseCase = createDefinitionUseCase;
        this.listWorkflowDefinitionsUseCase = listWorkflowDefinitionsUseCase;
        this.getWorkflowDefinitionUseCase = getWorkflowDefinitionUseCase;
        this.startWorkflowUseCase = startWorkflowUseCase;
        this.listApprovalRequestsUseCase = listApprovalRequestsUseCase;
        this.getApprovalRequestUseCase = getApprovalRequestUseCase;
        this.approveWorkflowStepUseCase = approveWorkflowStepUseCase;
        this.rejectWorkflowStepUseCase = rejectWorkflowStepUseCase;
        this.escalateWorkflowUseCase = escalateWorkflowUseCase;
        this.reassignWorkflowTaskUseCase = reassignWorkflowTaskUseCase;
        this.completeWorkflowUseCase = completeWorkflowUseCase;
        this.executeWorkflowTransitionUseCase = executeWorkflowTransitionUseCase;
    }
    createDefinition = async (request, response) => {
        const input = WorkflowApprovalValidator.createDefinition.parse(request.body);
        ApiResponse.created(response, await this.createDefinitionUseCase.execute({
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            ...input,
        }), "Workflow definition created");
    };
    startWorkflow = async (request, response) => {
        const input = WorkflowApprovalValidator.startWorkflow.parse(request.body);
        ApiResponse.created(response, await this.startWorkflowUseCase.execute({
            companyId: RequestContext.companyId(request),
            requestedBy: RequestContext.userId(request),
            ...input,
        }), "Workflow started");
    };
    listDefinitions = async (request, response) => {
        ApiResponse.ok(response, await this.listWorkflowDefinitionsUseCase.execute(RequestContext.companyId(request)), "Workflow definitions loaded");
    };
    getDefinition = async (request, response) => {
        ApiResponse.ok(response, await this.getWorkflowDefinitionUseCase.execute(RequestContext.companyId(request), String(request.params.workflowDefinitionId ?? "")), "Workflow definition loaded");
    };
    listRequests = async (request, response) => {
        const query = WorkflowApprovalValidator.listRequests.parse(request.query);
        ApiResponse.ok(response, await this.listApprovalRequestsUseCase.execute({
            companyId: RequestContext.companyId(request),
            status: query.status,
            requestedBy: query.mine ? RequestContext.userId(request) : undefined,
        }), "Approval requests loaded");
    };
    getRequest = async (request, response) => {
        ApiResponse.ok(response, await this.getApprovalRequestUseCase.execute(RequestContext.companyId(request), String(request.params.approvalRequestId ?? "")), "Approval request loaded");
    };
    approve = async (request, response) => {
        const input = WorkflowApprovalValidator.decision.parse(request.body);
        ApiResponse.ok(response, await this.approveWorkflowStepUseCase.execute({
            approvalRequestId: String(request.params.approvalRequestId ?? ""),
            approverUserId: RequestContext.userId(request),
            comments: input.comments,
        }), "Workflow step approved");
    };
    reject = async (request, response) => {
        const input = WorkflowApprovalValidator.decision.parse(request.body);
        ApiResponse.ok(response, await this.rejectWorkflowStepUseCase.execute({
            approvalRequestId: String(request.params.approvalRequestId ?? ""),
            approverUserId: RequestContext.userId(request),
            comments: input.comments,
        }), "Workflow step rejected");
    };
    escalate = async (request, response) => {
        ApiResponse.ok(response, await this.escalateWorkflowUseCase.execute(String(request.params.approvalRequestId ?? "")), "Workflow escalated");
    };
    reassign = async (request, response) => {
        const input = WorkflowApprovalValidator.reassign.parse(request.body);
        ApiResponse.ok(response, await this.reassignWorkflowTaskUseCase.execute({
            approvalRequestId: String(request.params.approvalRequestId ?? ""),
            actorUserId: RequestContext.userId(request),
            assigneeUserId: input.assigneeUserId,
            comments: input.comments,
        }), "Workflow task reassigned");
    };
    complete = async (request, response) => {
        ApiResponse.ok(response, await this.completeWorkflowUseCase.execute(String(request.params.approvalRequestId ?? "")), "Workflow completed");
    };
    transition = async (request, response) => {
        const input = WorkflowApprovalValidator.transition.parse(request.body);
        ApiResponse.ok(response, await this.executeWorkflowTransitionUseCase.execute(String(request.params.approvalRequestId ?? ""), input.status), "Workflow transitioned");
    };
}

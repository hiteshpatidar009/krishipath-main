import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../../shared/security";
export class WorkflowApprovalRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.post("/definitions", AuthorizationMiddleware.requirePermissions("workflow.definition.manage"), IdempotencyMiddleware.requireForMutations(), this.controller.createDefinition);
        this.router.get("/definitions", AuthorizationMiddleware.requirePermissions("workflow.definition.read"), this.controller.listDefinitions);
        this.router.get("/definitions/:workflowDefinitionId", AuthorizationMiddleware.requirePermissions("workflow.definition.read"), this.controller.getDefinition);
        this.router.post("/start", AuthorizationMiddleware.requirePermissions("workflow.request.create"), IdempotencyMiddleware.requireForMutations(), this.controller.startWorkflow);
        this.router.get("/requests", AuthorizationMiddleware.requirePermissions("workflow.request.read"), this.controller.listRequests);
        this.router.get("/requests/:approvalRequestId", AuthorizationMiddleware.requirePermissions("workflow.request.read"), this.controller.getRequest);
        this.router.post("/:approvalRequestId/approve", AuthorizationMiddleware.requirePermissions("workflow.approval.decide"), IdempotencyMiddleware.requireForMutations(), this.controller.approve);
        this.router.post("/:approvalRequestId/reject", AuthorizationMiddleware.requirePermissions("workflow.approval.decide"), IdempotencyMiddleware.requireForMutations(), this.controller.reject);
        this.router.post("/:approvalRequestId/escalate", AuthorizationMiddleware.requirePermissions("workflow.approval.escalate"), IdempotencyMiddleware.requireForMutations(), this.controller.escalate);
        this.router.post("/:approvalRequestId/reassign", AuthorizationMiddleware.requirePermissions("workflow.approval.reassign"), IdempotencyMiddleware.requireForMutations(), this.controller.reassign);
        this.router.post("/:approvalRequestId/complete", AuthorizationMiddleware.requirePermissions("workflow.request.complete"), IdempotencyMiddleware.requireForMutations(), this.controller.complete);
        this.router.post("/:approvalRequestId/transition", AuthorizationMiddleware.requirePermissions("workflow.request.transition"), IdempotencyMiddleware.requireForMutations(), this.controller.transition);
    }
}

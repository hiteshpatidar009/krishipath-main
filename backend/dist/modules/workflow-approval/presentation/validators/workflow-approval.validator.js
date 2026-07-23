import { z } from "zod";
const normalizeDefinitionInput = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return value;
    }
    const input = value;
    const steps = Array.isArray(input.steps) ?
        input.steps.map((step) => {
            if (!step || typeof step !== "object" || Array.isArray(step)) {
                return step;
            }
            const item = step;
            return {
                ...item,
                stepName: item.stepName ?? item.name,
                approverRoleId: item.approverRoleId ?? item.roleId,
                approverUserId: item.approverUserId ?? item.userId,
                minimumApprovals: item.minimumApprovals ?? 1,
            };
        })
        : input.steps;
    return {
        ...input,
        moduleName: input.moduleName ?? input.module,
        workflowName: input.workflowName ?? input.name,
        triggerEvent: input.triggerEvent ?? input.event,
        steps,
    };
};
export class WorkflowApprovalValidator {
    static createDefinition = z.preprocess(normalizeDefinitionInput, z.object({
        moduleName: z.string().min(2),
        workflowName: z.string().min(2),
        triggerEvent: z.string().min(2),
        entityType: z.string().min(2),
        description: z.string().optional(),
        steps: z
            .array(z.object({
            stepName: z.string().min(2),
            approverRoleId: z.string().uuid().optional(),
            approverUserId: z.string().uuid().optional(),
            minimumApprovals: z.number().int().min(1).default(1),
            conditions: z.unknown().optional(),
            actionType: z.string().optional(),
        }))
            .min(1),
    }));
    static startWorkflow = z.object({
        workflowDefinitionId: z.string().uuid(),
        entityType: z.string().min(2),
        entityId: z.string().uuid(),
    });
    static decision = z.object({
        comments: z.string().optional(),
    });
    static listRequests = z.object({
        status: z.string().optional(),
        mine: z.coerce.boolean().optional(),
    });
    static reassign = z.object({
        assigneeUserId: z.string().uuid(),
        comments: z.string().optional(),
    });
    static transition = z.object({
        status: z.string().min(2),
    });
}

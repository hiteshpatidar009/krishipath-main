export class WorkflowEngine {
    async execute(definition, context) {
        const stepsById = new Map(definition.steps.map((step) => [step.id, step]));
        const completedStepIds = [];
        let currentStep = stepsById.get(definition.startStepId);
        while (currentStep) {
            const result = await currentStep.execute(context);
            if (result.status === "failed" || result.status === "cancelled") {
                return {
                    workflowId: context.workflowId,
                    status: result.status,
                    completedStepIds,
                    currentStepId: currentStep.id,
                    reason: result.reason,
                };
            }
            if (result.status === "waiting_approval") {
                return {
                    workflowId: context.workflowId,
                    status: "waiting_approval",
                    completedStepIds,
                    currentStepId: currentStep.id,
                    reason: result.reason,
                };
            }
            completedStepIds.push(currentStep.id);
            const nextStepId = result.nextStepId ?? currentStep.nextStepId;
            currentStep = nextStepId ? stepsById.get(nextStepId) : undefined;
        }
        return {
            workflowId: context.workflowId,
            status: "completed",
            completedStepIds,
        };
    }
}

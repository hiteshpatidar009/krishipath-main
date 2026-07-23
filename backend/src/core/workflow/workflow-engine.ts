import {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowStep,
} from "./workflow.types";

export class WorkflowEngine {
  public async execute<TData>(
    definition: WorkflowDefinition<TData>,
    context: WorkflowContext<TData>,
  ): Promise<WorkflowExecutionResult> {
    const stepsById = new Map(definition.steps.map((step) => [step.id, step]));
    const completedStepIds: string[] = [];
    let currentStep: WorkflowStep<TData> | undefined = stepsById.get(
      definition.startStepId,
    );

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

export type WorkflowStepKind =
  | "approval"
  | "condition"
  | "automation"
  | "notification"
  | "integration";

export type WorkflowExecutionStatus =
  | "pending"
  | "running"
  | "waiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export interface WorkflowContext<TData = Record<string, unknown>> {
  readonly workflowId: string;
  readonly companyId: string;
  readonly actorId: string;
  readonly data: Readonly<TData>;
}

export interface WorkflowStep<TData = Record<string, unknown>> {
  readonly id: string;
  readonly name: string;
  readonly kind: WorkflowStepKind;
  readonly nextStepId?: string;
  execute(context: WorkflowContext<TData>): Promise<WorkflowStepResult>;
}

export interface WorkflowStepResult {
  readonly status: WorkflowExecutionStatus;
  readonly nextStepId?: string;
  readonly reason?: string;
}

export interface WorkflowDefinition<TData = Record<string, unknown>> {
  readonly id: string;
  readonly name: string;
  readonly version: number;
  readonly startStepId: string;
  readonly steps: readonly WorkflowStep<TData>[];
}

export interface WorkflowExecutionResult {
  readonly workflowId: string;
  readonly status: WorkflowExecutionStatus;
  readonly completedStepIds: readonly string[];
  readonly currentStepId?: string;
  readonly reason?: string;
}

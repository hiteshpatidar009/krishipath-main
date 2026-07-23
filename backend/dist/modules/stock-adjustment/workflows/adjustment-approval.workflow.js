import { AdjustmentApprovalPolicy } from "../domain";
export class AdjustmentApprovalWorkflow {
    policy = new AdjustmentApprovalPolicy();
    resolve(quantity) {
        return this.policy.requiresApproval(quantity) ? "approval_required" : "auto_approve";
    }
}

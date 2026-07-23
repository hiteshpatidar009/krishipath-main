export class CountApprovalWorkflow {
    requiresAdjustmentApproval(varianceQuantity) {
        return varianceQuantity !== 0;
    }
}

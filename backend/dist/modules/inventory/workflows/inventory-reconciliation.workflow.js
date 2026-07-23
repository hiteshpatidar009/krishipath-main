export class InventoryReconciliationWorkflow {
    requiresReview(variance, threshold) {
        return Math.abs(variance) >= threshold;
    }
}

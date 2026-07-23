export class ProcurementOrchestrator {
    detectApprovalRequired(totalAmount) {
        return totalAmount >= 50_000;
    }
    detectLandedCostReadiness() {
        return true;
    }
}

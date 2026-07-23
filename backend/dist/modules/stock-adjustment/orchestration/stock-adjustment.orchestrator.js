export class StockAdjustmentOrchestrator {
    adjustments;
    constructor(adjustments) {
        this.adjustments = adjustments;
    }
    create(input) { return this.adjustments.create(input); }
}

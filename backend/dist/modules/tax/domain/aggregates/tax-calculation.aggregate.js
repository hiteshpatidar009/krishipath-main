export class TaxCalculationAggregate {
    result;
    constructor(result) {
        this.result = result;
    }
    totalTax() {
        return this.result.taxAmount;
    }
    toResult() {
        return this.result;
    }
}

export class TaxEngineContractAdapter {
    calculateTaxUseCase;
    estimateTaxUseCase;
    constructor(calculateTaxUseCase, estimateTaxUseCase) {
        this.calculateTaxUseCase = calculateTaxUseCase;
        this.estimateTaxUseCase = estimateTaxUseCase;
    }
    async calculate(input, context) {
        return this.calculateTaxUseCase.execute(input, context);
    }
    async estimate(input, context) {
        return this.estimateTaxUseCase.execute(input, context);
    }
}

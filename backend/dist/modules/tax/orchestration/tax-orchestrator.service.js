export class TaxOrchestratorService {
    calculateTaxUseCase;
    estimateTaxUseCase;
    constructor(calculateTaxUseCase, estimateTaxUseCase) {
        this.calculateTaxUseCase = calculateTaxUseCase;
        this.estimateTaxUseCase = estimateTaxUseCase;
    }
    async calculateAndSnapshot(input, context) {
        return this.calculateTaxUseCase.execute(input, context);
    }
    async estimateOnly(input, context) {
        return this.estimateTaxUseCase.execute(input, context);
    }
}

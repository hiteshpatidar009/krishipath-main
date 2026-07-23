export class EstimateTaxUseCase {
    calculateTaxUseCase;
    constructor(calculateTaxUseCase) {
        this.calculateTaxUseCase = calculateTaxUseCase;
    }
    async execute(input, context) {
        return this.calculateTaxUseCase.calculate(input, context);
    }
}

export class ReorderStockPlanningContractAdapter {
    generateUseCase;
    constructor(generateUseCase) {
        this.generateUseCase = generateUseCase;
    }
    generateRecommendations(input) {
        return this.generateUseCase.execute(input);
    }
}

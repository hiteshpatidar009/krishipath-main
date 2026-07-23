export class StockAdjustmentContractAdapter {
    createUseCase;
    moduleName = "stock-adjustment";
    version = "1.0.0";
    constructor(createUseCase) {
        this.createUseCase = createUseCase;
    }
    create(input) {
        return this.createUseCase.execute(input);
    }
}

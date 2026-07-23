export class StockTransferContractAdapter {
    createUseCase;
    transitionUseCase;
    moduleName = "stock-transfer";
    version = "1.0.0";
    constructor(createUseCase, transitionUseCase) {
        this.createUseCase = createUseCase;
        this.transitionUseCase = transitionUseCase;
    }
    create(input) { return this.createUseCase.execute(input); }
    async dispatch(input) {
        await this.transitionUseCase.execute(input, "in_transit");
    }
}

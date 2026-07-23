export class StockReservationContractAdapter {
    createUseCase;
    releaseUseCase;
    moduleName = "stock-reservation";
    version = "1.0.0";
    constructor(createUseCase, releaseUseCase) {
        this.createUseCase = createUseCase;
        this.releaseUseCase = releaseUseCase;
    }
    reserve(input) {
        return this.createUseCase.execute(input);
    }
    async release(input) {
        await this.releaseUseCase.execute(input);
    }
}

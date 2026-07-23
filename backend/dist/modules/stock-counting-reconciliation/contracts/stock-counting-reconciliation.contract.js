export class StockCountingContractAdapter {
    createSessionUseCase;
    recordCountUseCase;
    constructor(createSessionUseCase, recordCountUseCase) {
        this.createSessionUseCase = createSessionUseCase;
        this.recordCountUseCase = recordCountUseCase;
    }
    createSession(input) {
        return this.createSessionUseCase.execute(input);
    }
    recordCount(input) {
        return this.recordCountUseCase.execute(input);
    }
}

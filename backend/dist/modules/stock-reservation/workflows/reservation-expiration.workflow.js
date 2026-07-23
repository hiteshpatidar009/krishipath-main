export class ReservationExpirationWorkflow {
    expireUseCase;
    constructor(expireUseCase) {
        this.expireUseCase = expireUseCase;
    }
    execute(companyId, actorId) {
        return this.expireUseCase.execute(companyId, actorId);
    }
}

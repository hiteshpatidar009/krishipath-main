export class StockTransferOrchestrator {
    transfers;
    constructor(transfers) {
        this.transfers = transfers;
    }
    create(input) { return this.transfers.create(input); }
    dispatch(input) { return this.transfers.dispatch(input); }
}

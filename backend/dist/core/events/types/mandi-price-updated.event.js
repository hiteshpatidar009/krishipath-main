export class MandiPriceUpdatedEvent {
    payload;
    id = crypto.randomUUID();
    name = "MandiPriceUpdated";
    source = "TraderService";
    occurredAt = new Date();
    eventType = "domain";
    aggregateId;
    aggregateName = "Mandi";
    version = 1;
    metadata = {};
    constructor(payload) {
        this.payload = payload;
        this.aggregateId = payload.mandiId;
    }
}

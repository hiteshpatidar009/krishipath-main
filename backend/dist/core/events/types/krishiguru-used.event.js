export class KrishiGuruUsedEvent {
    payload;
    id = crypto.randomUUID();
    name = "KrishiGuruUsed";
    source = "KrishiGuruService";
    occurredAt = new Date();
    eventType = "domain";
    aggregateId;
    aggregateName = "Farmer";
    version = 1;
    metadata = {};
    constructor(payload) {
        this.payload = payload;
        this.aggregateId = payload.farmerId;
    }
}

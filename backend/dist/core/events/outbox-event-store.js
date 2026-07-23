export class InMemoryOutboxEventStore {
    records = new Map();
    async append(event) {
        this.records.set(event.id, {
            id: event.id,
            event,
            status: "pending",
            createdAt: new Date(),
        });
    }
    async markPublished(eventId) {
        this.update(eventId, { status: "published", publishedAt: new Date() });
    }
    async markFailed(eventId, reason) {
        this.update(eventId, { status: "failed", failureReason: reason });
    }
    async listPending(limit) {
        return [...this.records.values()]
            .filter((record) => record.status === "pending")
            .slice(0, limit);
    }
    update(eventId, patch) {
        const record = this.records.get(eventId);
        if (!record) {
            throw new Error(`Outbox event not found: ${eventId}`);
        }
        this.records.set(eventId, { ...record, ...patch });
    }
}

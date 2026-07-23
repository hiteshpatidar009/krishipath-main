export class TransactionalEventPublisher {
    outboxEventStore;
    dispatcher;
    constructor(outboxEventStore, dispatcher) {
        this.outboxEventStore = outboxEventStore;
        this.dispatcher = dispatcher;
    }
    async publishAfterCommit(unitOfWork, event) {
        await this.outboxEventStore.append(event);
        unitOfWork.afterCommit(async () => {
            try {
                await this.dispatcher.dispatch(event, {
                    enforceIdempotency: true,
                    retryCount: 3,
                    retryDelayMs: 250,
                });
                await this.outboxEventStore.markPublished(event.id);
            }
            catch (error) {
                const reason = error instanceof Error ? error.message : "Unknown error";
                await this.outboxEventStore.markFailed(event.id, reason);
                throw error;
            }
        });
    }
}

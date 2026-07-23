export class EventDispatcher {
    eventBus;
    deadLetterStore;
    constructor(eventBus, deadLetterStore) {
        this.eventBus = eventBus;
        this.deadLetterStore = deadLetterStore;
    }
    async dispatch(event, options = {}) {
        const result = await this.eventBus.publish(event, options);
        for (const handlerName of result.failedHandlers) {
            await this.deadLetterStore.save({
                event,
                handlerName,
                failedAt: new Date(),
                reason: "Handler failed after retry policy",
                retryCount: options.retryCount ?? 0,
            });
        }
    }
}

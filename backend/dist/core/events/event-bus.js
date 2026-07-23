import { randomUUID } from "crypto";
import { EventEnvelopeFactory } from "./event-envelope";
export class EventBus {
    subscribers = new Map();
    processedKeys = new Set();
    subscribe(eventName, handler) {
        const handlers = this.subscribers.get(eventName) ?? new Set();
        handlers.add(handler);
        this.subscribers.set(eventName, handlers);
        return {
            unsubscribe: () => handlers.delete(handler),
        };
    }
    async publish(event, options = {}) {
        const envelope = EventEnvelopeFactory.create({
            ...event,
            id: event.id || randomUUID(),
        });
        const idempotencyKey = envelope.metadata.idempotencyKey ?? envelope.id;
        if (options.enforceIdempotency !== false) {
            if (this.processedKeys.has(idempotencyKey)) {
                return {
                    eventId: envelope.id,
                    eventName: envelope.name,
                    handledBy: [],
                    failedHandlers: [],
                };
            }
            this.processedKeys.add(idempotencyKey);
        }
        const handlers = [...(this.subscribers.get(envelope.name) ?? [])];
        const handledBy = [];
        const failedHandlers = [];
        for (const handler of handlers) {
            const succeeded = await this.executeHandler(handler, envelope, options);
            if (succeeded) {
                handledBy.push(handler.handlerName);
            }
            else {
                failedHandlers.push(handler.handlerName);
            }
        }
        return {
            eventId: envelope.id,
            eventName: envelope.name,
            handledBy,
            failedHandlers,
        };
    }
    async publishMany(events, options = {}) {
        const results = [];
        for (const event of events) {
            results.push(await this.publish(event, options));
        }
        return results;
    }
    clearIdempotencyCache() {
        this.processedKeys.clear();
    }
    async executeHandler(handler, event, options) {
        const maxAttempts = Math.max(1, (options.retryCount ?? 0) + 1);
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                await handler.handle(event);
                return true;
            }
            catch {
                if (attempt === maxAttempts) {
                    return false;
                }
                await this.delay(options.retryDelayMs ?? 100);
            }
        }
        return false;
    }
    async delay(ms) {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

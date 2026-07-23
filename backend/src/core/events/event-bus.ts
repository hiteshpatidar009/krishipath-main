import { randomUUID } from "crypto";

import { EventEnvelope, EventEnvelopeFactory } from "./event-envelope";
import { EventHandler, EventSubscription } from "./event-handler";

export interface PublishOptions {
  readonly retryCount?: number;
  readonly retryDelayMs?: number;
  readonly enforceIdempotency?: boolean;
}

export interface PublishResult {
  readonly eventId: string;
  readonly eventName: string;
  readonly handledBy: readonly string[];
  readonly failedHandlers: readonly string[];
}

type StoredHandler = EventHandler<EventEnvelope>;

export class EventBus {
  private readonly subscribers = new Map<string, Set<StoredHandler>>();
  private readonly processedKeys = new Set<string>();

  public subscribe<TPayload>(
    eventName: string,
    handler: EventHandler<EventEnvelope<TPayload>>,
  ): EventSubscription {
    const handlers = this.subscribers.get(eventName) ?? new Set<StoredHandler>();
    handlers.add(handler as StoredHandler);
    this.subscribers.set(eventName, handlers);

    return {
      unsubscribe: () => handlers.delete(handler as StoredHandler),
    };
  }

  public async publish<TPayload>(
    event: EventEnvelope<TPayload>,
    options: PublishOptions = {},
  ): Promise<PublishResult> {
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
    const handledBy: string[] = [];
    const failedHandlers: string[] = [];

    for (const handler of handlers) {
      const succeeded = await this.executeHandler(handler, envelope, options);
      if (succeeded) {
        handledBy.push(handler.handlerName);
      } else {
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

  public async publishMany(
    events: readonly EventEnvelope[],
    options: PublishOptions = {},
  ): Promise<readonly PublishResult[]> {
    const results: PublishResult[] = [];
    for (const event of events) {
      results.push(await this.publish(event, options));
    }
    return results;
  }

  public clearIdempotencyCache(): void {
    this.processedKeys.clear();
  }

  private async executeHandler(
    handler: StoredHandler,
    event: EventEnvelope,
    options: PublishOptions,
  ): Promise<boolean> {
    const maxAttempts = Math.max(1, (options.retryCount ?? 0) + 1);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await handler.handle(event);
        return true;
      } catch {
        if (attempt === maxAttempts) {
          return false;
        }
        await this.delay(options.retryDelayMs ?? 100);
      }
    }

    return false;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

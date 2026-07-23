import { DeadLetterStore } from "./dead-letter-event";
import { EventBus, PublishOptions } from "./event-bus";
import { EventEnvelope } from "./event-envelope";

export class EventDispatcher {
  constructor(
    private readonly eventBus: EventBus,
    private readonly deadLetterStore: DeadLetterStore,
  ) {}

  public async dispatch(
    event: EventEnvelope,
    options: PublishOptions = {},
  ): Promise<void> {
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

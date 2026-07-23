import { UnitOfWork } from "../transactions";
import { EventDispatcher } from "./event-dispatcher";
import { EventEnvelope } from "./event-envelope";
import { OutboxEventStore } from "./outbox-event-store";

export class TransactionalEventPublisher {
  constructor(
    private readonly outboxEventStore: OutboxEventStore,
    private readonly dispatcher: EventDispatcher,
  ) {}

  public async publishAfterCommit(
    unitOfWork: UnitOfWork,
    event: EventEnvelope,
  ): Promise<void> {
    await this.outboxEventStore.append(event);
    unitOfWork.afterCommit(async () => {
      try {
        await this.dispatcher.dispatch(event, {
          enforceIdempotency: true,
          retryCount: 3,
          retryDelayMs: 250,
        });
        await this.outboxEventStore.markPublished(event.id);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        await this.outboxEventStore.markFailed(event.id, reason);
        throw error;
      }
    });
  }
}

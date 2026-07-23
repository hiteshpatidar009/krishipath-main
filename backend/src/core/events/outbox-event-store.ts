import { EventEnvelope } from "./event-envelope";

export type OutboxEventStatus = "pending" | "published" | "failed";

export interface OutboxEventRecord {
  readonly id: string;
  readonly event: EventEnvelope;
  readonly status: OutboxEventStatus;
  readonly createdAt: Date;
  readonly publishedAt?: Date;
  readonly failureReason?: string;
}

export interface OutboxEventStore {
  append(event: EventEnvelope): Promise<void>;
  markPublished(eventId: string): Promise<void>;
  markFailed(eventId: string, reason: string): Promise<void>;
  listPending(limit: number): Promise<readonly OutboxEventRecord[]>;
}

export class InMemoryOutboxEventStore implements OutboxEventStore {
  private readonly records = new Map<string, OutboxEventRecord>();

  public async append(event: EventEnvelope): Promise<void> {
    this.records.set(event.id, {
      id: event.id,
      event,
      status: "pending",
      createdAt: new Date(),
    });
  }

  public async markPublished(eventId: string): Promise<void> {
    this.update(eventId, { status: "published", publishedAt: new Date() });
  }

  public async markFailed(eventId: string, reason: string): Promise<void> {
    this.update(eventId, { status: "failed", failureReason: reason });
  }

  public async listPending(limit: number): Promise<readonly OutboxEventRecord[]> {
    return [...this.records.values()]
      .filter((record) => record.status === "pending")
      .slice(0, limit);
  }

  private update(
    eventId: string,
    patch: Partial<Omit<OutboxEventRecord, "id" | "event" | "createdAt">>,
  ): void {
    const record = this.records.get(eventId);
    if (!record) {
      throw new Error(`Outbox event not found: ${eventId}`);
    }

    this.records.set(eventId, { ...record, ...patch });
  }
}

import { EventEnvelope } from "./event-envelope";

export interface DeadLetterEvent {
  readonly event: EventEnvelope;
  readonly handlerName: string;
  readonly failedAt: Date;
  readonly reason: string;
  readonly retryCount: number;
}

export interface DeadLetterStore {
  save(deadLetter: DeadLetterEvent): Promise<void>;
  list(): Promise<readonly DeadLetterEvent[]>;
}

export class InMemoryDeadLetterStore implements DeadLetterStore {
  private readonly items: DeadLetterEvent[] = [];

  public async save(deadLetter: DeadLetterEvent): Promise<void> {
    this.items.push(Object.freeze(deadLetter));
  }

  public async list(): Promise<readonly DeadLetterEvent[]> {
    return [...this.items];
  }
}

export interface QueueMessage<TPayload = unknown> {
  readonly id: string;
  readonly topic: string;
  readonly payload: Readonly<TPayload>;
  readonly availableAt: Date;
}

export interface QueuePort {
  publish<TPayload>(message: QueueMessage<TPayload>): Promise<void>;
  consume(topic: string, limit: number): Promise<readonly QueueMessage[]>;
}

export class InMemoryQueue implements QueuePort {
  private readonly messages: QueueMessage[] = [];

  public async publish<TPayload>(message: QueueMessage<TPayload>): Promise<void> {
    this.messages.push(message);
  }

  public async consume(topic: string, limit: number): Promise<readonly QueueMessage[]> {
    return this.messages
      .filter((message) => message.topic === topic && message.availableAt <= new Date())
      .slice(0, limit);
  }
}

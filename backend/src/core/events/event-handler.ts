import { EventEnvelope } from "./event-envelope";

export interface EventHandler<TEvent extends EventEnvelope = EventEnvelope> {
  readonly handlerName: string;
  handle(event: TEvent): Promise<void> | void;
}

export interface EventSubscription {
  unsubscribe(): void;
}

import { EventEnvelope } from "./event-envelope";

export interface DomainEvent<TPayload = unknown> extends EventEnvelope<TPayload> {
  readonly eventType: "domain";
  readonly aggregateId: string;
  readonly aggregateName: string;
  readonly version: number;
}

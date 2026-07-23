import { EventEnvelope } from "./event-envelope";

export interface IntegrationEvent<TPayload = unknown>
  extends EventEnvelope<TPayload> {
  readonly eventType: "integration";
  readonly sourceModule: string;
  readonly targetModule?: string;
  readonly schemaVersion: number;
}

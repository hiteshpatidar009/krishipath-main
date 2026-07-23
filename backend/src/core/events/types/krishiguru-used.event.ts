import { DomainEvent } from "../domain-event";

export interface KrishiGuruUsedPayload {
  farmerId: string;
}

export class KrishiGuruUsedEvent implements DomainEvent<KrishiGuruUsedPayload> {
  public readonly id = crypto.randomUUID();
  public readonly name = "KrishiGuruUsed";
  public readonly source = "KrishiGuruService";
  public readonly occurredAt = new Date();
  public readonly eventType = "domain" as const;
  public readonly aggregateId: string;
  public readonly aggregateName = "Farmer";
  public readonly version = 1;
  public readonly metadata: any = {};

  constructor(public readonly payload: KrishiGuruUsedPayload) {
    this.aggregateId = payload.farmerId;
  }
}

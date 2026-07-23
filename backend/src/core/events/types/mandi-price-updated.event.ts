import { DomainEvent } from "../domain-event";

export interface MandiPriceUpdatedPayload {
  mandiId: string;
  productId: string;
  traderId: string | null;
  newPrice: string;
}

export class MandiPriceUpdatedEvent implements DomainEvent<MandiPriceUpdatedPayload> {
  public readonly id = crypto.randomUUID();
  public readonly name = "MandiPriceUpdated";
  public readonly source = "TraderService";
  public readonly occurredAt = new Date();
  public readonly eventType = "domain" as const;
  public readonly aggregateId: string;
  public readonly aggregateName = "Mandi";
  public readonly version = 1;
  public readonly metadata: any = {};

  constructor(public readonly payload: MandiPriceUpdatedPayload) {
    this.aggregateId = payload.mandiId;
  }
}

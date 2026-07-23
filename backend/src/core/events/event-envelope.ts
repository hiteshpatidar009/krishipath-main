export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly companyId?: string;
  readonly userId?: string;
  readonly idempotencyKey?: string;
  readonly traceId?: string;
}

export interface EventEnvelope<TPayload = unknown> {
  readonly id: string;
  readonly name: string;
  readonly source: string;
  readonly occurredAt: Date;
  readonly payload: Readonly<TPayload>;
  readonly metadata: Readonly<EventMetadata>;
}

export class EventEnvelopeFactory {
  public static create<TPayload>(
    input: Omit<EventEnvelope<TPayload>, "occurredAt"> & {
      readonly occurredAt?: Date;
    },
  ): EventEnvelope<TPayload> {
    return {
      ...input,
      occurredAt: input.occurredAt ?? new Date(),
      metadata: Object.freeze({ ...input.metadata }),
      payload: Object.freeze(input.payload),
    };
  }
}

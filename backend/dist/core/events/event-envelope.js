export class EventEnvelopeFactory {
    static create(input) {
        return {
            ...input,
            occurredAt: input.occurredAt ?? new Date(),
            metadata: Object.freeze({ ...input.metadata }),
            payload: Object.freeze(input.payload),
        };
    }
}

import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { StockReservationEvents } from "../events/stock-reservation.events";
export class CreateReservationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.create(input);
        await this.publish(StockReservationEvents.created, result.reservationId, input.companyId, input.createdBy, { ...input });
        await logger.security("Stock reservation created", {
            module: "stock-reservation",
            action: StockReservationEvents.created,
            companyId: input.companyId,
            userId: input.createdBy,
            actorId: input.createdBy,
            payload: { reservationId: result.reservationId, sourceType: input.sourceType },
        });
        return result;
    }
    async publish(name, id, companyId, actorId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id, name, source: "stock-reservation", payload,
            metadata: { companyId, userId: actorId },
        }));
    }
}
export class ReleaseReservationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.release(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.reservationId,
            name: StockReservationEvents.released,
            source: "stock-reservation",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        await logger.security("Stock reservation released", {
            module: "stock-reservation",
            action: StockReservationEvents.released,
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { reservationId: input.reservationId },
        });
        return { released: true };
    }
}
export class AllocateReservationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.allocate(input);
        return { allocated: true };
    }
}
export class FulfillReservationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.fulfill(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.reservationId,
            name: StockReservationEvents.fulfilled,
            source: "stock-reservation",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        return { fulfilled: true };
    }
}
export class ExpireReservationsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, actorId) {
        const result = await this.repository.expire(companyId, actorId);
        if (result.expiredCount > 0) {
            await CoreEventBus.publish(EventEnvelopeFactory.create({
                id: `${companyId}:${Date.now()}`,
                name: StockReservationEvents.expired,
                source: "stock-reservation",
                payload: result,
                metadata: { companyId, userId: actorId },
            }));
            await logger.security("Stock reservations expired", {
                module: "stock-reservation",
                action: StockReservationEvents.expired,
                companyId,
                userId: actorId,
                actorId,
                payload: result,
            });
        }
        return result;
    }
}
export class ListReservationsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.list(input);
        return { ...result, page: input.page, limit: input.limit };
    }
}
export class GetReservationSummaryUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId) {
        return this.repository.getReservationSummary(companyId);
    }
}
export class GetReservationActivitiesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId) {
        return this.repository.getReservationActivities(companyId);
    }
}
export class GetReservationDetailsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, id) {
        return this.repository.getReservationDetails(companyId, id);
    }
}

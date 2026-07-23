import { BaseService } from "../../../core/base/base.service";
import { MandiPriceUpdatedEvent } from "../../../core/events/types/mandi-price-updated.event";
export class TraderService extends BaseService {
    traderRepo;
    priceRepo;
    eventDispatcher;
    constructor(traderRepo, priceRepo, eventDispatcher) {
        super("TraderService");
        this.traderRepo = traderRepo;
        this.priceRepo = priceRepo;
        this.eventDispatcher = eventDispatcher;
    }
    async getProfile(userId) {
        return this.traderRepo.findByUserId(userId);
    }
    async updatePrice(traderId, mandiId, productId, pricePerQuintal, updatedBy) {
        // Upsert the active price
        await this.priceRepo.upsertPrice(traderId, mandiId, productId, pricePerQuintal, updatedBy);
        // Record in history table
        await this.priceRepo.recordHistory(traderId, mandiId, productId, pricePerQuintal, updatedBy);
        // Dispatch event to invalidate cache and recalculate average
        await this.eventDispatcher.dispatch(new MandiPriceUpdatedEvent({
            traderId,
            mandiId,
            productId,
            newPrice: pricePerQuintal,
        }));
    }
}

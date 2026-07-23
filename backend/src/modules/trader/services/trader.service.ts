import { BaseService } from "../../../core/base/base.service";
import { TraderRepository } from "../repositories/trader.repository";
import { PriceRepository } from "../../mandi/repositories/price.repository";
import { EventDispatcher } from "../../../core/events/event-dispatcher";
import { MandiPriceUpdatedEvent } from "../../../core/events/types/mandi-price-updated.event";

export class TraderService extends BaseService {
  constructor(
    private readonly traderRepo: TraderRepository,
    private readonly priceRepo: PriceRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {
    super("TraderService");
  }

  public async getProfile(userId: string) {
    return this.traderRepo.findByUserId(userId);
  }

  public async updatePrice(
    traderId: string,
    mandiId: string,
    productId: string,
    pricePerQuintal: string,
    updatedBy: string,
  ) {
    // Upsert the active price
    await this.priceRepo.upsertPrice(
      traderId,
      mandiId,
      productId,
      pricePerQuintal,
      updatedBy,
    );

    // Record in history table
    await this.priceRepo.recordHistory(
      traderId,
      mandiId,
      productId,
      pricePerQuintal,
      updatedBy,
    );

    // Dispatch event to invalidate cache and recalculate average
    await this.eventDispatcher.dispatch(
      new MandiPriceUpdatedEvent({
        traderId,
        mandiId,
        productId,
        newPrice: pricePerQuintal,
      }),
    );
  }
}

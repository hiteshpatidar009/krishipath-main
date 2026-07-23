import { MandiPriceUpdatedEvent } from "../../../core/events/types/mandi-price-updated.event";
import { MandiService } from "../services/mandi.service";
import { logger } from "../../../infrastructure/logger";

export class MandiPriceUpdatedHandler {
  constructor(private readonly mandiService: MandiService) {}

  public async handle(event: MandiPriceUpdatedEvent) {
    const { mandiId, productId, newPrice } = event.payload;
    try {
      // Invalidate the cache for the mandi
      await this.mandiService.invalidateMandiCache(mandiId);
      logger.info("Invalidated mandi price cache", { mandiId, productId, newPrice });
    } catch (error) {
      logger.error(new Error("Failed to invalidate mandi cache on price update"), {
        originalError: error instanceof Error ? error.message : String(error),
        mandiId,
      });
    }
  }
}

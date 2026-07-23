import { logger } from "../../../infrastructure/logger";
export class MandiPriceUpdatedHandler {
    mandiService;
    constructor(mandiService) {
        this.mandiService = mandiService;
    }
    async handle(event) {
        const { mandiId, productId, newPrice } = event.payload;
        try {
            // Invalidate the cache for the mandi
            await this.mandiService.invalidateMandiCache(mandiId);
            logger.info("Invalidated mandi price cache", { mandiId, productId, newPrice });
        }
        catch (error) {
            logger.error(new Error("Failed to invalidate mandi cache on price update"), {
                originalError: error instanceof Error ? error.message : String(error),
                mandiId,
            });
        }
    }
}

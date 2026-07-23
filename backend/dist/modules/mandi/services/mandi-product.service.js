import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
export class MandiProductService extends BaseService {
    mandiProductRepo;
    mandiAdminRepo;
    localizedBuilder;
    constructor(mandiProductRepo, mandiAdminRepo, localizedBuilder) {
        super("MandiProductService");
        this.mandiProductRepo = mandiProductRepo;
        this.mandiAdminRepo = mandiAdminRepo;
        this.localizedBuilder = localizedBuilder;
    }
    /**
     * Get all products for a mandi (enabled + disabled) — for admin catalog view.
     */
    async getCrops(mandiId, lang = "en") {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        const crops = await this.mandiProductRepo.findByMandi(mandiId);
        return this.localizedBuilder.hydrateList("PRODUCT", crops, ["cropName"], lang, "productId");
    }
    /**
     * Get only enabled products — for public farmer-facing view.
     */
    async getEnabledCrops(mandiId, lang = "en") {
        const crops = await this.mandiProductRepo.findEnabledByMandi(mandiId);
        return this.localizedBuilder.hydrateList("PRODUCT", crops, ["cropName"], lang, "productId");
    }
    /**
     * Enable or disable a product for a mandi.
     */
    async toggleCrop(mandiId, productId, isEnabled, priceInitStrategy, sourcePriceMandiId) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        const existing = await this.mandiProductRepo.findOne(mandiId, productId);
        const id = existing?.id ?? randomUUID();
        await this.mandiProductRepo.upsert({
            id,
            mandiId,
            productId,
            isEnabled,
            priceInitStrategy,
            sourcePriceMandiId: sourcePriceMandiId ?? null,
        });
        return this.mandiProductRepo.findOne(mandiId, productId);
    }
    /**
     * Bulk toggle multiple products at once.
     */
    async bulkToggleCrops(mandiId, products) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        await Promise.all(products.map((c) => this.mandiProductRepo.upsert({
            id: randomUUID(),
            mandiId,
            productId: c.productId,
            isEnabled: c.isEnabled,
            priceInitStrategy: "EMPTY",
        })));
    }
    /**
     * Bulk assign products to multiple mandis simultaneously.
     */
    async bulkAssignCrops(mandiIds, productIds) {
        const records = mandiIds.flatMap((mandiId) => productIds.map((productId) => ({
            id: randomUUID(),
            mandiId,
            productId,
            isEnabled: true,
            priceInitStrategy: "EMPTY",
        })));
        await this.mandiProductRepo.bulkInsert(records);
        return { assigned: records.length };
    }
}

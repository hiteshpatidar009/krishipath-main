import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
export class MandiCropService extends BaseService {
    mandiCropRepo;
    mandiAdminRepo;
    constructor(mandiCropRepo, mandiAdminRepo) {
        super("MandiCropService");
        this.mandiCropRepo = mandiCropRepo;
        this.mandiAdminRepo = mandiAdminRepo;
    }
    /**
     * Get all crops for a mandi (enabled + disabled) — for admin catalog view.
     */
    async getCrops(mandiId) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        return this.mandiCropRepo.findByMandi(mandiId);
    }
    /**
     * Get only enabled crops — for public farmer-facing view.
     */
    async getEnabledCrops(mandiId) {
        return this.mandiCropRepo.findEnabledByMandi(mandiId);
    }
    /**
     * Enable or disable a crop for a mandi.
     */
    async toggleCrop(mandiId, cropId, isEnabled, priceInitStrategy, sourcePriceMandiId) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        const existing = await this.mandiCropRepo.findOne(mandiId, cropId);
        const id = existing?.id ?? randomUUID();
        await this.mandiCropRepo.upsert({
            id,
            mandiId,
            cropId,
            isEnabled,
            priceInitStrategy,
            sourcePriceMandiId: sourcePriceMandiId ?? null,
        });
        return this.mandiCropRepo.findOne(mandiId, cropId);
    }
    /**
     * Bulk toggle multiple crops at once.
     */
    async bulkToggleCrops(mandiId, crops) {
        const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
        if (!mandi)
            throw new AppError("Mandi not found", 404);
        await Promise.all(crops.map((c) => this.mandiCropRepo.upsert({
            id: randomUUID(),
            mandiId,
            cropId: c.cropId,
            isEnabled: c.isEnabled,
            priceInitStrategy: "EMPTY",
        })));
    }
    /**
     * Bulk assign crops to multiple mandis simultaneously.
     */
    async bulkAssignCrops(mandiIds, cropIds) {
        const records = mandiIds.flatMap((mandiId) => cropIds.map((cropId) => ({
            id: randomUUID(),
            mandiId,
            cropId,
            isEnabled: true,
            priceInitStrategy: "EMPTY",
        })));
        await this.mandiCropRepo.bulkInsert(records);
        return { assigned: records.length };
    }
}

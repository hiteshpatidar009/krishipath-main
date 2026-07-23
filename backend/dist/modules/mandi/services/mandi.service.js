import { BaseService } from "../../../core/base/base.service";
export class MandiService extends BaseService {
    mandiRepo;
    priceRepo;
    redisService;
    localizedBuilder;
    constructor(mandiRepo, priceRepo, redisService, localizedBuilder) {
        super("MandiService");
        this.mandiRepo = mandiRepo;
        this.priceRepo = priceRepo;
        this.redisService = redisService;
        this.localizedBuilder = localizedBuilder;
    }
    async getAllMandis(lang = "en") {
        const mandis = await this.mandiRepo.findAll();
        return this.localizedBuilder.hydrateList("MANDI", mandis, ["name"], lang);
    }
    async getMandiDetails(mandiId, lang = "en") {
        let mandi = await this.mandiRepo.findById(mandiId);
        if (!mandi)
            return null;
        mandi = await this.localizedBuilder.hydrate("MANDI", mandi, ["name"], lang);
        const cacheKey = `mandi:${mandiId}:avg_prices`;
        const cached = await this.redisService.get(cacheKey);
        let avgPrices = cached ? JSON.parse(cached) : null;
        if (!avgPrices) {
            avgPrices = await this.calculateAveragePrices(mandiId);
            await this.redisService.set(cacheKey, JSON.stringify(avgPrices), 60); // 60s TTL
        }
        return {
            ...mandi,
            averagePrices: avgPrices,
        };
    }
    async calculateAveragePrices(mandiId) {
        const activePrices = await this.priceRepo.getActivePricesForMandi(mandiId);
        const variantTotals = {};
        for (const p of activePrices) {
            if (!variantTotals[p.variantId]) {
                variantTotals[p.variantId] = { sum: 0, count: 0 };
            }
            variantTotals[p.variantId].sum += parseFloat(p.pricePerQuintal);
            variantTotals[p.variantId].count += 1;
        }
        const averages = {};
        for (const [variantId, data] of Object.entries(variantTotals)) {
            averages[variantId] = Math.round(data.sum / data.count);
        }
        return averages;
    }
    async invalidateMandiCache(mandiId) {
        await this.redisService.del(`mandi:${mandiId}:avg_prices`);
    }
}

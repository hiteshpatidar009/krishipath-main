import { BaseService } from "../../../core/base/base.service";
import { MandiRepository } from "../repositories/mandi.repository";
import { PriceRepository } from "../repositories/price.repository";
import { RedisService } from "../../../infrastructure/database/redis/redis.service";
import { LocalizedResponseBuilder } from "../../../shared/localization/localized-response.builder";

export class MandiService extends BaseService {
  constructor(
    private readonly mandiRepo: MandiRepository,
    private readonly priceRepo: PriceRepository,
    private readonly redisService: RedisService,
    private readonly localizedBuilder: LocalizedResponseBuilder,
  ) {
    super("MandiService");
  }

  public async getAllMandis(lang: string = "en") {
    const mandis = await this.mandiRepo.findAll();
    return this.localizedBuilder.hydrateList("MANDI", mandis, ["name"], lang);
  }

  public async getMandiDetails(mandiId: string, lang: string = "en") {
    let mandi = await this.mandiRepo.findById(mandiId);
    if (!mandi) return null;

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

  private async calculateAveragePrices(mandiId: string) {
    const activePrices = await this.priceRepo.getActivePricesForMandi(mandiId);
    const variantTotals: Record<string, { sum: number; count: number }> = {};

    for (const p of activePrices) {
      if (!variantTotals[p.variantId]) {
        variantTotals[p.variantId] = { sum: 0, count: 0 };
      }
      variantTotals[p.variantId].sum += parseFloat(p.pricePerQuintal);
      variantTotals[p.variantId].count += 1;
    }

    const averages: Record<string, number> = {};
    for (const [variantId, data] of Object.entries(variantTotals)) {
      averages[variantId] = Math.round(data.sum / data.count);
    }
    return averages;
  }

  public async invalidateMandiCache(mandiId: string) {
    await this.redisService.del(`mandi:${mandiId}:avg_prices`);
  }
}

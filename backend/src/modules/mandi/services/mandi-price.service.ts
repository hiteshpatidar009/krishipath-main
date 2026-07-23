import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { MandiPriceRepository } from "../repositories/mandi-price.repository";
import { MandiAdminRepository } from "../repositories/mandi-admin.repository";
import { MandiTraderRepository } from "../repositories/mandi-trader.repository";
import { TraderPriceRepository } from "../repositories/trader-price.repository";

export class MandiPriceService extends BaseService {
  constructor(
    private readonly mandiPriceRepo: MandiPriceRepository,
    private readonly mandiAdminRepo: MandiAdminRepository,
    private readonly mandiTraderRepo: MandiTraderRepository,
    private readonly traderPriceRepo: TraderPriceRepository,
    private readonly priceRepo: any,
  ) {
    super("MandiPriceService");
  }

  public async getTraderPrices(mandiId: string, variantId: string, priceDate: string) {
    if (!mandiId || !variantId || !priceDate) throw new AppError("mandiId, variantId, and priceDate are required", 400);

    const officialPrice = await this.mandiPriceRepo.findOne(mandiId, variantId, priceDate);
    const traderPrices = await this.traderPriceRepo.findByMandiAndVariant(mandiId, variantId);

    return { officialPrice, traderPrices };
  }

  public async updateTraderPrice(
    traderId: string,
    mandiId: string,
    variantId: string,
    pricePerQuintal: string,
    updatedBy: string,
    priceDate: string,
    grade?: string,
  ) {
    if (!traderId || !mandiId || !variantId || !pricePerQuintal) {
      throw new AppError("Missing required fields for trader price", 400);
    }
    if (!updatedBy) throw new AppError("An authenticated user is required to publish a trader price", 401);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(priceDate || ""))) {
      throw new AppError("priceDate must use YYYY-MM-DD format", 400);
    }

    const numericPrice = Number(pricePerQuintal);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      throw new AppError("pricePerQuintal must be a positive number", 400);
    }

    const assignment = await this.mandiTraderRepo.findOne(mandiId, traderId);
    if (!assignment || assignment.status !== "ACTIVE") {
      throw new AppError("Trader must be actively assigned to this mandi before publishing a price", 400);
    }

    // A trader offer is not an official mandi rate. Keep the two data sources
    // separate so the farmer app never presents an offer as official data.
    await this.traderPriceRepo.upsert({
      id: randomUUID(),
      traderId,
      mandiId,
      variantId,
      pricePerQuintal,
      priceDate,
      grade: String(grade || "").trim() || undefined,
      updatedBy,
    });

    await this.priceRepo.recordHistory(traderId, mandiId, variantId, pricePerQuintal, updatedBy);

    return this.getTraderPrices(mandiId, variantId, priceDate);
  }

  /**
   * Saves the complete admin price sheet for one mandi/crop/date. This matches
   * the operations UI contract while keeping the legacy single-offer method
   * available for older clients.
   */
  public async updateCropPriceSheet(data: {
    mandiId: string;
    productId: string;
    priceDate: string;
    updatedBy: string;
    officialPrice?: {
      priceModal: string;
      priceMin?: string;
      priceMax?: string;
      arrivalQuantity?: string;
      arrivalUnit?: string;
      source?: string;
      grade?: string;
      unit?: string;
    };
    traderPrices?: Array<{
      traderId: string;
      pricePerQuintal: string;
      grade?: string;
    }>;
  }) {
    if (!data.updatedBy) throw new AppError("An authenticated user is required to save prices", 401);
    if (!data.mandiId || !data.productId || !/^\d{4}-\d{2}-\d{2}$/.test(String(data.priceDate || ""))) {
      throw new AppError("mandiId, productId, and a YYYY-MM-DD priceDate are required", 400);
    }
    const traderPrices = Array.isArray(data.traderPrices) ? data.traderPrices : [];
    if (!data.officialPrice && traderPrices.length === 0) {
      throw new AppError("An official price or at least one trader price is required", 400);
    }
    if (traderPrices.length > 100) throw new AppError("A maximum of 100 trader prices is allowed", 400);
    for (const offer of traderPrices) {
      if (!offer?.traderId || !Number.isFinite(Number(offer.pricePerQuintal)) || Number(offer.pricePerQuintal) <= 0) {
        throw new AppError("Every trader price requires traderId and a positive pricePerQuintal", 400);
      }
    }

    if (data.officialPrice) {
      await this.setOfficialPrice({
        mandiId: data.mandiId,
        variantId: data.productId,
        priceDate: data.priceDate,
        priceModal: data.officialPrice.priceModal,
        priceMin: data.officialPrice.priceMin,
        priceMax: data.officialPrice.priceMax,
        arrivalQuantity: data.officialPrice.arrivalQuantity,
        arrivalUnit: data.officialPrice.arrivalUnit,
        source: data.officialPrice.source || "ADMIN",
        grade: data.officialPrice.grade,
        unit: data.officialPrice.unit || "QUINTAL",
        setBy: data.updatedBy,
      });
    }

    for (const offer of traderPrices) {
      await this.updateTraderPrice(
        offer.traderId,
        data.mandiId,
        data.productId,
        offer.pricePerQuintal,
        data.updatedBy,
        data.priceDate,
        offer.grade,
      );
    }
    return this.getTraderPrices(data.mandiId, data.productId, data.priceDate);
  }

  public async getOfficialPrices(mandiId: string) {
    const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
    if (!mandi) throw new AppError("Mandi not found", 404);
    const prices = await this.mandiPriceRepo.findLatestByMandi(mandiId);
    const byCrop = new Map<string, typeof prices>();
    for (const price of prices) {
      const rows = byCrop.get(price.cropId) || [];
      rows.push(price);
      byCrop.set(price.cropId, rows);
    }

    return Array.from(byCrop.values()).map((rows) => {
      const latest = rows[0];
      const previous = rows[1];
      const currentPrice = Number(latest.priceModal);
      const previousPrice = previous ? Number(previous.priceModal) : null;
      const changeAmt = previousPrice !== null && Number.isFinite(previousPrice)
        ? currentPrice - previousPrice
        : null;
      const changePercent = previousPrice !== null && previousPrice > 0
        ? ((changeAmt as number) / previousPrice) * 100
        : null;
      const sparklineData = rows
        .slice(0, 14)
        .reverse()
        .map((row) => Number(row.priceModal))
        .filter((value) => Number.isFinite(value) && value > 0);

      return {
        ...latest,
        previousPrice: previousPrice !== null && Number.isFinite(previousPrice) ? previousPrice : null,
        previousPriceDate: previous?.priceDate || null,
        changeAmt,
        changePercent,
        sparklineData,
      };
    });
  }

  public async setOfficialPrice(data: {
    mandiId: string;
    variantId: string;
    priceMin?: string;
    priceMax?: string;
    priceModal: string;
    priceDate: string;
    arrivalQuantity?: string;
    arrivalUnit?: string;
    source?: string;
    grade?: string;
    unit?: string;
    setBy?: string;
  }) {
    if (!data.mandiId || !data.variantId || !data.priceModal || !data.priceDate) {
      throw new AppError("mandiId, variantId, priceModal, and priceDate are required", 400);
    }

    const modal = Number(data.priceModal);
    const min = data.priceMin === undefined ? null : Number(data.priceMin);
    const max = data.priceMax === undefined ? null : Number(data.priceMax);
    const arrival = data.arrivalQuantity === undefined ? null : Number(data.arrivalQuantity);
    if (!Number.isFinite(modal) || modal <= 0) {
      throw new AppError("priceModal must be a positive number", 400);
    }
    if ((min !== null && (!Number.isFinite(min) || min < 0 || min > modal)) ||
        (max !== null && (!Number.isFinite(max) || max < modal))) {
      throw new AppError("Prices must satisfy 0 <= priceMin <= priceModal <= priceMax", 400);
    }
    if (arrival !== null && (!Number.isFinite(arrival) || arrival < 0)) {
      throw new AppError("arrivalQuantity must be a non-negative number", 400);
    }

    await this.mandiPriceRepo.upsert({
      ...data,
      arrivalUnit: arrival !== null ? (String(data.arrivalUnit || "QUINTAL").trim().toUpperCase()) : undefined,
      id: randomUUID(),
    });

    return this.mandiPriceRepo.findOne(data.mandiId, data.variantId, data.priceDate);
  }

  public async setOfficialPrices(
    mandiId: string,
    records: Array<{
      productId: string;
      priceMin?: string;
      priceMax?: string;
      priceModal: string;
      priceDate: string;
      arrivalQuantity?: string;
      arrivalUnit?: string;
      source?: string;
      grade?: string;
      unit?: string;
    }>,
    setBy?: string,
  ) {
    if (!mandiId || !Array.isArray(records) || records.length === 0) {
      throw new AppError("mandiId and at least one price record are required", 400);
    }
    if (records.length > 500) throw new AppError("A maximum of 500 price records is allowed", 400);

    for (const record of records) {
      const min = record.priceMin === undefined ? null : Number(record.priceMin);
      const modal = Number(record.priceModal);
      const max = record.priceMax === undefined ? null : Number(record.priceMax);
      const arrival = record.arrivalQuantity === undefined ? null : Number(record.arrivalQuantity);
      if (!record.productId || !record.priceDate || !Number.isFinite(modal) || modal <= 0) {
        throw new AppError("Each record requires productId, priceDate, and a positive priceModal", 400);
      }
      if ((min !== null && (!Number.isFinite(min) || min < 0 || min > modal)) ||
          (max !== null && (!Number.isFinite(max) || max < modal))) {
        throw new AppError("Prices must satisfy 0 <= priceMin <= priceModal <= priceMax", 400);
      }
      if (arrival !== null && (!Number.isFinite(arrival) || arrival < 0)) {
        throw new AppError("arrivalQuantity must be a non-negative number", 400);
      }
    }

    await this.mandiPriceRepo.bulkInsert(records.map((record) => ({
      id: randomUUID(),
      mandiId,
      variantId: record.productId,
      priceMin: record.priceMin,
      priceMax: record.priceMax,
      priceModal: record.priceModal,
      priceDate: record.priceDate,
      arrivalQuantity: record.arrivalQuantity,
      arrivalUnit: record.arrivalQuantity !== undefined
        ? String(record.arrivalUnit || "QUINTAL").trim().toUpperCase()
        : undefined,
      source: record.source || "ADMIN",
      grade: record.grade,
      unit: record.unit || "QUINTAL",
      setBy,
    })));
    return this.getOfficialPrices(mandiId);
  }

  /**
   * Copy official prices from one mandi to another.
   */
  public async copyPrices(
    sourceMandiId: string,
    targetMandiId: string,
    variantIds: string[] | null,
    setBy?: string,
  ) {
    const [sourceMandi, targetMandi] = await Promise.all([
      this.mandiAdminRepo.findByIdFull(sourceMandiId),
      this.mandiAdminRepo.findByIdFull(targetMandiId),
    ]);

    if (!sourceMandi) throw new AppError("Source mandi not found", 404);
    if (!targetMandi) throw new AppError("Target mandi not found", 404);

    const sourcePrices = await this.mandiPriceRepo.findLatestByMandi(sourceMandiId);
    const today = new Date().toISOString().split("T")[0];

    const filtered = variantIds
      ? sourcePrices.filter((p) => variantIds.includes(p.variantId))
      : sourcePrices;

    if (filtered.length === 0) {
      return { copied: 0 };
    }

    await this.mandiPriceRepo.bulkInsert(
      filtered.map((p) => ({
        id: randomUUID(),
        mandiId: targetMandiId,
        variantId: p.variantId,
        priceModal: p.priceModal ?? "0",
        priceDate: today,
        priceMin: p.priceMin ?? undefined,
        priceMax: p.priceMax ?? undefined,
        setBy,
        source: "ADMIN",
      })),
    );

    return { copied: filtered.length };
  }
}

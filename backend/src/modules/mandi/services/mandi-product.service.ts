import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { MandiProductRepository } from "../repositories/mandi-product.repository";
import { MandiAdminRepository } from "../repositories/mandi-admin.repository";
import { LocalizedResponseBuilder } from "../../../shared/localization/localized-response.builder";

export class MandiProductService extends BaseService {
  constructor(
    private readonly mandiProductRepo: MandiProductRepository,
    private readonly mandiAdminRepo: MandiAdminRepository,
    private readonly localizedBuilder: LocalizedResponseBuilder,
  ) {
    super("MandiProductService");
  }

  /**
   * Get all products for a mandi (enabled + disabled) — for admin catalog view.
   */
  public async getCrops(mandiId: string, lang: string = "en") {
    const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
    if (!mandi) throw new AppError("Mandi not found", 404);
    const crops = await this.mandiProductRepo.findByMandi(mandiId);
    return this.localizedBuilder.hydrateList("PRODUCT", crops, ["cropName"], lang, "productId");
  }

  /**
   * Get only enabled products — for public farmer-facing view.
   */
  public async getEnabledCrops(mandiId: string, lang: string = "en") {
    const crops = await this.mandiProductRepo.findEnabledByMandi(mandiId);
    return this.localizedBuilder.hydrateList("PRODUCT", crops, ["cropName"], lang, "productId");
  }

  /**
   * Enable or disable a product for a mandi.
   */
  public async toggleCrop(
    mandiId: string,
    productId: string,
    isEnabled: boolean,
    priceInitStrategy?: string,
    sourcePriceMandiId?: string,
  ) {
    const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
    if (!mandi) throw new AppError("Mandi not found", 404);

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
  public async bulkToggleCrops(
    mandiId: string,
    products: Array<{ productId: string; isEnabled: boolean }>,
  ) {
    const mandi = await this.mandiAdminRepo.findByIdFull(mandiId);
    if (!mandi) throw new AppError("Mandi not found", 404);

    await Promise.all(
      products.map((c) =>
        this.mandiProductRepo.upsert({
          id: randomUUID(),
          mandiId,
          productId: c.productId,
          isEnabled: c.isEnabled,
          priceInitStrategy: "EMPTY",
        }),
      ),
    );
  }

  /**
   * Bulk assign products to multiple mandis simultaneously.
   */
  public async bulkAssignCrops(
    mandiIds: string[],
    productIds: string[],
  ) {
    const records = mandiIds.flatMap((mandiId) =>
      productIds.map((productId) => ({
        id: randomUUID(),
        mandiId,
        productId,
        isEnabled: true,
        priceInitStrategy: "EMPTY",
      })),
    );
    await this.mandiProductRepo.bulkInsert(records);
    return { assigned: records.length };
  }
}

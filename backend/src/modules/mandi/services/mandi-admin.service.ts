import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { MandiAdminRepository } from "../repositories/mandi-admin.repository";
import { MandiProductRepository } from "../repositories/mandi-product.repository";
import { MandiPriceRepository } from "../repositories/mandi-price.repository";
import { RedisService } from "../../../infrastructure/database/redis/redis.service";
import { LocalizedResponseBuilder } from "../../../shared/localization/localized-response.builder";
import { TranslationService } from "../../localization/services/translation.service";

interface CopyOptions {
  products?: boolean;
  settings?: boolean;
  prices?: boolean;
  traders?: boolean;
}

export class MandiAdminService extends BaseService {
  constructor(
    private readonly mandiAdminRepo: MandiAdminRepository,
    private readonly mandiProductRepo: MandiProductRepository,
    private readonly mandiPriceRepo: MandiPriceRepository,
    private readonly redisService: RedisService,
    private readonly localizedBuilder: LocalizedResponseBuilder,
    private readonly translationService?: TranslationService,
  ) {
    super("MandiAdminService");
  }

  public async listMandis(params: {
    page?: number;
    limit?: number;
    search?: string;
    stateId?: string;
    districtId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    return this.mandiAdminRepo.findAllPaginated({ ...params, page, limit });
  }

  public async getMandi(id: string) {
    const mandi = await this.mandiAdminRepo.findByIdFull(id);
    if (!mandi) throw new AppError("Mandi not found", 404);
    return mandi;
  }

  public async createMandi(
    data: {
      stateId: string;
      districtId: string;
      name: string;
      address?: string;
      latitude?: string;
      longitude?: string;
      openingTime?: string;
      closingTime?: string;
      workingDays?: unknown;
      description?: string;
      imageUrls?: unknown;
      currency?: string;
      defaultUnit?: string;
      defaultLanguageCode?: string;
      aiPredictionEnabled?: boolean;
      notificationsEnabled?: boolean;
      priceVisibility?: string;
      analyticsEnabled?: boolean;
      translations?: Record<string, string>;
    },
    createdBy: string | null,
  ) {
    const id = randomUUID();
    const code = await this.mandiAdminRepo.getNextCode();
    const slug = this.generateSlug(data.name, code);

    const mandi = await this.mandiAdminRepo.create({
      id,
      code,
      slug,
      ...data,
      createdBy,
    });

    // Handle translations
    if (mandi) {
      if (data.translations && this.translationService) {
        const records = [];
        for (const [lang, val] of Object.entries(data.translations as Record<string, string>)) {
          if (val?.trim()) {
            records.push({
              entityType: "MANDI",
              entityId: id,
              fieldName: "name",
              languageCode: lang,
              value: val.trim(),
              translatedBy: createdBy || undefined,
            });
          }
        }
        if (records.length > 0) {
          await this.translationService.bulkUpsert(records);
        }
      } else if (data.name) {
        // Seed translation placeholders for all V1 languages
        await this.localizedBuilder.seedTranslations(
          "MANDI",
          id,
          { name: data.name, ...(data.description ? { description: data.description } : {}) },
          createdBy || undefined,
        );
      }
    }

    return mandi;
  }

  public async updateMandi(id: string, data: Record<string, unknown>) {
    const existing = await this.mandiAdminRepo.findByIdFull(id);
    if (!existing) throw new AppError("Mandi not found", 404);
    const { translations, ...updateData } = data as any;
    
    if (existing.status === "ARCHIVED") {
      throw new AppError("Cannot update an archived mandi", 400);
    }

    const updated = await this.mandiAdminRepo.update(id, updateData);
    
    if (translations && this.translationService) {
      const records = [];
      const transObj = translations as Record<string, string>;
      for (const [lang, val] of Object.entries(transObj)) {
        if (val?.trim()) {
          records.push({
            entityType: "MANDI",
            entityId: id,
            fieldName: "name",
            languageCode: lang,
            value: val.trim(),
          });
        }
      }
      if (records.length > 0) {
        await this.translationService.bulkUpsert(records);
      }
    }
    
    await this.invalidateMandiCache(id);
    return updated;
  }

  public async setStatus(id: string, status: string) {
    const validStatuses = ["ACTIVE", "INACTIVE", "SEASONAL", "MAINTENANCE", "ARCHIVED"];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const existing = await this.mandiAdminRepo.findByIdFull(id);
    if (!existing) throw new AppError("Mandi not found", 404);

    if (status === "ARCHIVED") {
      await this.mandiAdminRepo.archive(id);
    } else {
      await this.mandiAdminRepo.update(id, { status });
    }

    await this.invalidateMandiCache(id);
    return this.mandiAdminRepo.findByIdFull(id);
  }

  /**
   * Duplicate a mandi: copy its structure to a new mandi.
   * Runs synchronously and returns the created mandi + job summary.
   */
  public async duplicateMandi(
    sourceMandiId: string,
    targetName: string,
    copyOptions: CopyOptions,
    createdBy: string,
  ) {
    const sourceMandi = await this.mandiAdminRepo.findByIdFull(sourceMandiId);
    if (!sourceMandi) throw new AppError("Source mandi not found", 404);

    const jobId = randomUUID();

    // Track the job
    await this.mandiAdminRepo.createDuplicateJob({
      id: jobId,
      sourceMandiId,
      targetName,
      copyOptions,
      createdBy,
    });
    await this.mandiAdminRepo.updateDuplicateJob(jobId, {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    });

    try {
      // Create the new mandi (copy settings if requested)
      const newMandi = await this.createMandi(
        {
          stateId: sourceMandi.stateId,
          districtId: sourceMandi.districtId,
          name: targetName,
          ...(copyOptions.settings
            ? {
                openingTime: sourceMandi.openingTime ?? undefined,
                closingTime: sourceMandi.closingTime ?? undefined,
                workingDays: sourceMandi.workingDays ?? undefined,
                currency: sourceMandi.currency,
                defaultUnit: sourceMandi.defaultUnit,
                defaultLanguageCode: sourceMandi.defaultLanguageCode ?? undefined,
                aiPredictionEnabled: sourceMandi.aiPredictionEnabled,
                notificationsEnabled: sourceMandi.notificationsEnabled,
                priceVisibility: sourceMandi.priceVisibility,
                analyticsEnabled: sourceMandi.analyticsEnabled,
              }
            : {}),
        },
        createdBy,
      );

      const newMandiId = newMandi!.id;

      // Copy products if requested
      if (copyOptions.products) {
        const sourceCrops = await this.mandiProductRepo.findByMandi(sourceMandiId);
        if (sourceCrops.length > 0) {
          await this.mandiProductRepo.bulkInsert(
            sourceCrops.map((c) => ({
              id: randomUUID(),
              mandiId: newMandiId,
              productId: c.productId,
              isEnabled: true,
              priceInitStrategy: copyOptions.prices ? "COPY_FROM_MANDI" : "EMPTY",
            })),
          );
        }
      }

      // Copy official prices if requested
      if (copyOptions.prices) {
        const sourcePrices = await this.mandiPriceRepo.findLatestByMandi(sourceMandiId);
        const today = new Date().toISOString().split("T")[0];
        if (sourcePrices.length > 0) {
          await this.mandiPriceRepo.bulkInsert(
            sourcePrices.map((p) => ({
              id: randomUUID(),
              mandiId: newMandiId,
              variantId: p.variantId,
              priceModal: p.priceModal ?? "0",
              priceDate: today,
              priceMin: p.priceMin ?? undefined,
              priceMax: p.priceMax ?? undefined,
              setBy: createdBy,
              source: "ADMIN",
            })),
          );
        }
      }

      await this.mandiAdminRepo.updateDuplicateJob(jobId, {
        targetMandiId: newMandiId,
        status: "COMPLETED",
        completedAt: new Date(),
      });

      return { jobId, mandi: newMandi, status: "COMPLETED" };
    } catch (error: any) {
      await this.mandiAdminRepo.updateDuplicateJob(jobId, {
        status: "FAILED",
        error: error?.message ?? "Unknown error",
        completedAt: new Date(),
      });
      throw error;
    }
  }

  private generateSlug(name: string, code: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return `${base}-${code.toLowerCase()}`;
  }

  private async invalidateMandiCache(mandiId: string) {
    await this.redisService.del(`mandi:${mandiId}:avg_prices`);
  }
}

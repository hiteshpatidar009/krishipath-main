import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { ProductRepository } from "../repositories/product.repository";
import { ProductExtrasRepository } from "../repositories/product-extras.repository";
import { LocalizedResponseBuilder, EntityType } from "../../../shared/localization/localized-response.builder";
import { TranslationService } from "../../localization/services/translation.service";

export interface ClassificationInput {
  name: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  unitId?: string;
  sortOrder?: number;
  translations?: Record<string, string>;
  variants?: VariantInput[];
}

export interface VariantInput {
  name: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sortOrder?: number;
  translations?: Record<string, string>;
}

export interface CreateProductInput {
  name: string;
  category?: string;
  categoryId?: string;
  subcategoryId?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  classifications?: ClassificationInput[];
  aliases?: string[];
  mandiIds?: string[];
  translations?: Record<string, string>; // { en, hi, gu, mr, te }
}

export class ProductAdminService extends BaseService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly extrasRepo: ProductExtrasRepository,
    private readonly localizedBuilder: LocalizedResponseBuilder,
    private readonly translationService: TranslationService,
  ) {
    super("ProductAdminService");
  }

  /**
   * List all products with full details (classifications, alias count, mandi count).
   */
  public async getCrops(lang: string = "en") {
    const products = await this.productRepo.findAll();
    const hydrated = await this.localizedBuilder.hydrateList("PRODUCT", products, ["name"], lang);

    // Attach extras counts — graceful fallback if tables don't exist yet
    const withCounts = await Promise.all(
      (hydrated as any[]).map(async (p: any) => {
        try {
          const [classifications, aliases, mandis] = await Promise.all([
            this.extrasRepo.findClassificationsByProduct(p.id),
            this.extrasRepo.findAliasesByProduct(p.id),
            this.extrasRepo.findMandisByProduct(p.id),
          ]);
          return {
            ...p,
            classificationsCount: classifications.length,
            aliasesCount: aliases.length,
            mandiCount: (mandis as any[]).filter((m: any) => m.isActive).length,
          };
        } catch {
          return { ...p, classificationsCount: 0, aliasesCount: 0, mandiCount: 0 };
        }
      }),
    );

    return withCounts;
  }

  /**
   * Get single product with all details.
   */
  public async getCrop(id: string, lang: string = "en") {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError("Product not found", 404);

    const hydrated = await this.localizedBuilder.hydrate("PRODUCT", product, ["name"], lang);

    const [classifications, aliases, mandis] = await Promise.all([
      this.extrasRepo.findClassificationsByProduct(id),
      this.extrasRepo.findAliasesByProduct(id),
      this.extrasRepo.findMandisByProduct(id),
    ]);

    // Attach variants to each classification
    const classificationsWithVariants = await Promise.all(
      classifications.map(async (c) => {
        const variants = await this.extrasRepo.findVariantsByClassification(c.id);
        return { ...c, variants };
      }),
    );

    return {
      ...hydrated,
      classifications: classificationsWithVariants,
      aliases,
      mandis,
    };
  }

  /**
   * Create a product with full payload — classifications, variants, aliases, mandis.
   */
  public async createCrop(input: CreateProductInput, createdBy?: string) {
    const id = randomUUID();
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const code = `CRP_${Date.now().toString().slice(-6)}`;

    // 1. Create core product
    const product = await this.productRepo.create({
      id,
      code,
      name: input.name,
      slug,
      category: input.category || input.name, // fallback to name for legacy compat
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      description: input.description,
      imageUrl: input.imageUrl,
      status: input.status || "ACTIVE",
    });

    // 2. Seed translations
    const translationName = input.translations?.en || input.name;
    await this.localizedBuilder.seedTranslations(
      "PRODUCT",
      id,
      { name: translationName },
      createdBy,
    );

    // 3. Override translations if provided
    if (input.translations) {
      await this.upsertTranslations("PRODUCT", id, input.translations, createdBy);
    }

    // 4. Create classifications + variants
    if (input.classifications) {
      const translationRecords: any[] = [];

      for (let i = 0; i < input.classifications.length; i++) {
        const c = input.classifications[i];
        const classification = await this.extrasRepo.createClassification({
          productId: product.id,
          name: c.name,
          minPrice: c.minPrice?.toString(),
          maxPrice: c.maxPrice?.toString(),
          unitId: c.unitId,
          sortOrder: c.sortOrder ?? i,
        });

        if (c.translations) {
          for (const [lang, val] of Object.entries(c.translations)) {
            if (val?.trim()) {
              translationRecords.push({
                entityType: "PRODUCT_CLASSIFICATION",
                entityId: classification.id,
                fieldName: "name",
                languageCode: lang,
                value: val.trim(),
                translatedBy: createdBy,
              });
            }
          }
        }

        if (c.variants?.length) {
          for (let j = 0; j < c.variants.length; j++) {
            const v = c.variants[j];
            const variant = await this.extrasRepo.createVariant({
              classificationId: classification.id,
              name: v.name,
              minPrice: v.minPrice?.toString(),
              maxPrice: v.maxPrice?.toString(),
              sortOrder: v.sortOrder ?? j,
            });

            if (v.translations) {
              for (const [lang, val] of Object.entries(v.translations)) {
                if (val?.trim()) {
                  translationRecords.push({
                    entityType: "PRODUCT_VARIANT",
                    entityId: variant.id,
                    fieldName: "name",
                    languageCode: lang,
                    value: val.trim(),
                    translatedBy: createdBy,
                  });
                }
              }
            }
          }
        }
      }

      if (translationRecords.length > 0) {
        await this.translationService.bulkUpsert(translationRecords);
      }
    }

    // 5. Create aliases
    if (input.aliases?.length) {
      const filtered = input.aliases.filter((a) => a.trim());
      await this.extrasRepo.replaceAliases(id, filtered.map((a) => ({ alias: a.trim() })));
    }

    // 6. Assign mandis
    if (input.mandiIds?.length) {
      await this.extrasRepo.setMandiAssignments(id, input.mandiIds);
    }

    return this.getCrop(id);
  }

  /**
   * Update product basic info.
   */
  public async updateCrop(id: string, data: Partial<CreateProductInput>, updatedBy?: string) {
    const existing = await this.productRepo.findById(id);
    if (!existing) throw new AppError("Product not found", 404);

    if (data.name && data.name !== existing.name) {
      await this.localizedBuilder.seedTranslations("PRODUCT", id, { name: data.name }, updatedBy);
    }

    await this.productRepo.update(id, {
      name: data.name,
      category: data.category,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      description: data.description,
      status: data.status,
    });

    if (data.translations) {
      await this.upsertTranslations("PRODUCT", id, data.translations as Record<string, string>, updatedBy);
    }
    if (data.aliases !== undefined) {
      await this.extrasRepo.replaceAliases(
        id,
        data.aliases.filter((a) => a.trim()).map((a) => ({ alias: a.trim() })),
      );
    }
    if (data.mandiIds !== undefined) {
      await this.extrasRepo.setMandiAssignments(id, data.mandiIds);
    }

    if (data.classifications) {
      await this.extrasRepo.deleteClassificationsByProduct(id);
      
      const translationRecords: any[] = [];

      for (let i = 0; i < data.classifications.length; i++) {
        const c = data.classifications[i];
        const classification = await this.extrasRepo.createClassification({
          productId: id,
          name: c.name,
          minPrice: c.minPrice?.toString(),
          maxPrice: c.maxPrice?.toString(),
          unitId: c.unitId,
          sortOrder: i,
        });

        if (c.translations) {
          for (const [lang, val] of Object.entries(c.translations)) {
            if (val?.trim()) {
              translationRecords.push({
                entityType: "PRODUCT_CLASSIFICATION",
                entityId: classification.id,
                fieldName: "name",
                languageCode: lang,
                value: val.trim(),
                translatedBy: updatedBy,
              });
            }
          }
        }

        if (c.variants?.length) {
          for (let j = 0; j < c.variants.length; j++) {
            const v = c.variants[j];
            const variant = await this.extrasRepo.createVariant({
              classificationId: classification.id,
              name: v.name,
              minPrice: v.minPrice?.toString(),
              maxPrice: v.maxPrice?.toString(),
              sortOrder: v.sortOrder ?? j,
            });

            if (v.translations) {
              for (const [lang, val] of Object.entries(v.translations)) {
                if (val?.trim()) {
                  translationRecords.push({
                    entityType: "PRODUCT_VARIANT",
                    entityId: variant.id,
                    fieldName: "name",
                    languageCode: lang,
                    value: val.trim(),
                    translatedBy: updatedBy,
                  });
                }
              }
            }
          }
        }
      }

      if (translationRecords.length > 0) {
        await this.translationService.bulkUpsert(translationRecords);
      }
    }

    return this.getCrop(id);
  }

  public async upsertTranslations(
    entityType: string,
    id: string,
    translations: Record<string, string>,
    updatedBy?: string,
  ) {
    const records = [];
    for (const [lang, name] of Object.entries(translations)) {
      if (name?.trim()) {
        records.push({
          entityType,
          entityId: id,
          fieldName: "name",
          languageCode: lang,
          value: name.trim(),
          translatedBy: updatedBy,
        });
      }
    }
    if (records.length > 0) {
      await this.translationService.bulkUpsert(records);
    }
    return { ok: true };
  }

  // ── Classifications ─────────────────────────────────────────────────────────

  public async getClassifications(productId: string) {
    const classifications = await this.extrasRepo.findClassificationsByProduct(productId);
    return Promise.all(
      classifications.map(async (c) => {
        const variants = await this.extrasRepo.findVariantsByClassification(c.id);
        return { ...c, variants };
      }),
    );
  }

  public async addClassification(productId: string, data: ClassificationInput) {
    const classification = await this.extrasRepo.createClassification({
      productId,
      name: data.name,
      minPrice: data.minPrice?.toString(),
      maxPrice: data.maxPrice?.toString(),
      unitId: data.unitId,
    });

    if (data.variants?.length) {
      for (const v of data.variants) {
        await this.extrasRepo.createVariant({
          classificationId: classification.id,
          name: v.name,
          minPrice: v.minPrice?.toString(),
          maxPrice: v.maxPrice?.toString(),
        });
      }
    }

    const variants = await this.extrasRepo.findVariantsByClassification(classification.id);
    return { ...classification, variants };
  }

  public async updateClassification(id: string, data: Partial<ClassificationInput>) {
    return this.extrasRepo.updateClassification(id, {
      name: data.name,
      minPrice: data.minPrice?.toString(),
      maxPrice: data.maxPrice?.toString(),
      unitId: data.unitId,
    });
  }

  public async deleteClassification(id: string) {
    await this.extrasRepo.deleteClassification(id);
    return { ok: true };
  }

  // ── Variants ────────────────────────────────────────────────────────────────

  public async addVariant(classificationId: string, data: VariantInput) {
    return this.extrasRepo.createVariant({
      classificationId,
      name: data.name,
      minPrice: data.minPrice?.toString(),
      maxPrice: data.maxPrice?.toString(),
    });
  }

  public async updateVariant(id: string, data: Partial<VariantInput>) {
    return this.extrasRepo.updateVariant(id, {
      name: data.name,
      minPrice: data.minPrice?.toString(),
      maxPrice: data.maxPrice?.toString(),
    });
  }

  public async deleteVariant(id: string) {
    await this.extrasRepo.deleteVariant(id);
    return { ok: true };
  }

  // ── Aliases ─────────────────────────────────────────────────────────────────

  public async setAliases(productId: string, aliases: string[]) {
    return this.extrasRepo.replaceAliases(
      productId,
      aliases.filter((a) => a.trim()).map((a) => ({ alias: a.trim() })),
    );
  }

  // ── Mandis ──────────────────────────────────────────────────────────────────

  public async setMandis(productId: string, mandiIds: string[]) {
    return this.extrasRepo.setMandiAssignments(productId, mandiIds);
  }

  public async getMandis(productId: string) {
    return this.extrasRepo.findMandisByProduct(productId);
  }
}

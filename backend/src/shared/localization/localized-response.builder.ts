import { TranslationService } from "../../modules/localization/services/translation.service";

/** Languages supported in V1 */
export const V1_LANGUAGES = ["en", "hi", "mr", "gu", "te"] as const;
export type SupportedLang = (typeof V1_LANGUAGES)[number];

export type EntityType =
  | "PRODUCT"
  | "CATEGORY"
  | "SUBCATEGORY"
  | "VARIANT"
  | "UNIT"
  | "MANDI"
  | "ATTRIBUTE"
  | "NOTIFICATION"
  | "SYSTEM_TEXT";

/**
 * LocalizedResponseBuilder
 *
 * A utility class that services use to:
 *  1. Seed translation placeholders when a new entity is created
 *  2. Hydrate a list or single entity with translated field values before returning it
 *
 * Keeps business services clean — they call these methods instead of
 * directly interacting with the TranslationService or Redis.
 */
export class LocalizedResponseBuilder {
  constructor(private readonly translationService: TranslationService) {}

  /**
   * Call this immediately after creating a new entity (product, mandi, variant, etc.)
   * Seeds the English value as APPROVED, and creates DRAFT placeholders for other V1 languages.
   *
   * @param entityType  e.g. "PRODUCT"
   * @param entityId    UUID of the newly created entity
   * @param fields      Map of fieldName → English value, e.g. { name: "Onion", description: "..." }
   * @param createdBy   Admin user ID
   */
  public async seedTranslations(
    entityType: EntityType,
    entityId: string,
    fields: Record<string, string>,
    createdBy?: string,
  ): Promise<void> {
    const records: Array<{
      entityType: string;
      entityId: string;
      fieldName: string;
      languageCode: string;
      value: string;
      status: string;
      translatedBy?: string;
      aiGenerated: boolean;
    }> = [];

    for (const [fieldName, englishValue] of Object.entries(fields)) {
      if (!englishValue) continue;

      for (const lang of V1_LANGUAGES) {
        records.push({
          entityType,
          entityId,
          fieldName,
          languageCode: lang,
          value: englishValue,          // Use English as the fallback for all languages initially
          status: lang === "en" ? "APPROVED" : "DRAFT",
          translatedBy: createdBy,
          aiGenerated: false,
        });
      }
    }

    if (records.length > 0) {
      await this.translationService.bulkUpsert(records);
    }
  }

  /**
   * Hydrate a single entity's translatable fields with the resolved language value.
   *
   * @param entityType  e.g. "PRODUCT"
   * @param entity      The raw DB record (must have `.id`)
   * @param fields      Array of field names to translate, e.g. ["name", "description"]
   * @param lang        Language code from req.lang, e.g. "mr"
   */
  public async hydrate<T extends Record<string, unknown>>(
    entityType: EntityType,
    entity: T,
    fields: (keyof T & string)[],
    lang: string,
  ): Promise<T> {
    return this.translationService.resolveEntity(entityType, entity, fields, lang);
  }

  /**
   * Hydrate a list of entities efficiently in one bulk DB call.
   *
   * @param entityType  e.g. "MANDI"
   * @param entities    Array of raw DB records
   * @param fields      Field names to translate
   * @param lang        Language code from req.lang
   * @param idField     Optional field name containing the entity ID (default: "id")
   */
  public async hydrateList<T extends Record<string, unknown>>(
    entityType: EntityType,
    entities: T[],
    fields: (keyof T & string)[],
    lang: string,
    idField: keyof T = "id" as keyof T,
  ): Promise<T[]> {
    return this.translationService.resolveEntityList(entityType, entities, fields, lang, idField);
  }
}

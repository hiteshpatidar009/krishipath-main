import { eq, and, inArray, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  entityTranslationsTable,
  translationAuditLogTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class TranslationRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  /**
   * Get all translations for a specific entity and field in a given language.
   */
  public async findOne(
    entityType: string,
    entityId: string,
    fieldName: string,
    languageCode: string,
  ) {
    const result = await this.db
      .select()
      .from(entityTranslationsTable)
      .where(
        and(
          eq(entityTranslationsTable.entityType, entityType),
          eq(entityTranslationsTable.entityId, entityId),
          eq(entityTranslationsTable.fieldName, fieldName),
          eq(entityTranslationsTable.languageCode, languageCode),
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  /**
   * Get all translations for an entity across all languages and fields.
   */
  public async findAllForEntity(entityType: string, entityId: string) {
    return this.db
      .select()
      .from(entityTranslationsTable)
      .where(
        and(
          eq(entityTranslationsTable.entityType, entityType),
          eq(entityTranslationsTable.entityId, entityId),
        ),
      );
  }

  /**
   * Get translations for multiple entities in bulk (for list responses).
   */
  public async findBulkForEntities(
    entityType: string,
    entityIds: string[],
    languageCode: string,
  ) {
    if (entityIds.length === 0) return [];
    return this.db
      .select()
      .from(entityTranslationsTable)
      .where(
        and(
          eq(entityTranslationsTable.entityType, entityType),
          inArray(entityTranslationsTable.entityId, entityIds),
          eq(entityTranslationsTable.languageCode, languageCode),
        ),
      );
  }

  /**
   * Upsert a single translation.
   */
  public async upsert(data: {
    id: string;
    entityType: string;
    entityId: string;
    fieldName: string;
    languageCode: string;
    value: string;
    status?: string;
    translatedBy?: string | null;
    aiGenerated?: boolean;
  }) {
    const now = new Date();
    await this.db
      .insert(entityTranslationsTable)
      .values({
        id: data.id,
        entityType: data.entityType,
        entityId: data.entityId,
        fieldName: data.fieldName,
        languageCode: data.languageCode,
        value: data.value,
        status: data.status ?? "APPROVED",
        translatedBy: data.translatedBy ?? null,
        aiGenerated: data.aiGenerated ?? false,
        version: 1,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          entityTranslationsTable.entityType,
          entityTranslationsTable.entityId,
          entityTranslationsTable.fieldName,
          entityTranslationsTable.languageCode,
        ],
        set: {
          value: data.value,
          status: data.status ?? "APPROVED",
          translatedBy: data.translatedBy ?? null,
          aiGenerated: data.aiGenerated ?? false,
          version: sql`${entityTranslationsTable.version} + 1`,
          updatedAt: now,
        },
      });
  }

  /**
   * Bulk upsert many translations at once.
   */
  public async bulkUpsert(
    records: Array<{
      id: string;
      entityType: string;
      entityId: string;
      fieldName: string;
      languageCode: string;
      value: string;
      aiGenerated?: boolean;
      translatedBy?: string | null;
    }>,
  ) {
    if (records.length === 0) return;
    const now = new Date();
    const values = records.map((r) => ({
      id: r.id,
      entityType: r.entityType,
      entityId: r.entityId,
      fieldName: r.fieldName,
      languageCode: r.languageCode,
      value: r.value,
      status: "APPROVED",
      translatedBy: r.translatedBy ?? null,
      aiGenerated: r.aiGenerated ?? false,
      version: 1,
      createdAt: now,
      updatedAt: now,
    }));

    await this.db
      .insert(entityTranslationsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [
          entityTranslationsTable.entityType,
          entityTranslationsTable.entityId,
          entityTranslationsTable.fieldName,
          entityTranslationsTable.languageCode,
        ],
        set: {
          value: sql`excluded.value`,
          version: sql`${entityTranslationsTable.version} + 1`,
          updatedAt: now,
        },
      });
  }

  /**
   * Find entities that have an English translation but are missing the target language.
   * Returns up to 200 records for the admin to fill in.
   */
  public async findMissing(languageCode: string, entityType?: string) {
    // Get all English translations
    let enQuery = this.db
      .select({
        entityType: entityTranslationsTable.entityType,
        entityId: entityTranslationsTable.entityId,
        fieldName: entityTranslationsTable.fieldName,
        englishValue: entityTranslationsTable.value,
      })
      .from(entityTranslationsTable)
      .where(eq(entityTranslationsTable.languageCode, "en"));

    const enTranslations = await enQuery;

    if (enTranslations.length === 0) return [];

    // Fetch all translations for the target language
    const targetLanguageRecords = await this.db
      .select({
        entityType: entityTranslationsTable.entityType,
        entityId: entityTranslationsTable.entityId,
        fieldName: entityTranslationsTable.fieldName,
      })
      .from(entityTranslationsTable)
      .where(eq(entityTranslationsTable.languageCode, languageCode));

    // Build a set of keys that already have translations
    const existingKeys = new Set(
      targetLanguageRecords.map(r => `${r.entityType}:${r.entityId}:${r.fieldName}`)
    );

    // Return records that are missing in the target language
    const missing = enTranslations.filter(r => {
      if (entityType && r.entityType !== entityType) return false;
      const key = `${r.entityType}:${r.entityId}:${r.fieldName}`;
      return !existingKeys.has(key);
    });

    return missing.slice(0, 200);
  }

  /**
   * Append to audit log.
   */
  public async addAuditLog(entry: {
    id: string;
    translationId: string;
    entityType: string;
    entityId: string;
    fieldName: string;
    languageCode: string;
    oldValue: string | null;
    newValue: string;
    action: string;
    changedBy?: string | null;
  }) {
    await this.db.insert(translationAuditLogTable).values({
      ...entry,
      createdAt: new Date(),
    });
  }

  public async updateStatus(
    entityType: string,
    entityId: string,
    fieldName: string,
    languageCode: string,
    status: string,
    reviewedBy?: string,
  ) {
    await this.db
      .update(entityTranslationsTable)
      .set({
        status,
        reviewedBy: reviewedBy ?? null,
        reviewedAt: reviewedBy ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(entityTranslationsTable.entityType, entityType),
          eq(entityTranslationsTable.entityId, entityId),
          eq(entityTranslationsTable.fieldName, fieldName),
          eq(entityTranslationsTable.languageCode, languageCode),
        ),
      );
  }
}

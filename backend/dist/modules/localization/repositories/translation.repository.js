import { eq, and, inArray, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { entityTranslationsTable, translationAuditLogTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class TranslationRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    /**
     * Get all translations for a specific entity and field in a given language.
     */
    async findOne(entityType, entityId, fieldName, languageCode) {
        const result = await this.db
            .select()
            .from(entityTranslationsTable)
            .where(and(eq(entityTranslationsTable.entityType, entityType), eq(entityTranslationsTable.entityId, entityId), eq(entityTranslationsTable.fieldName, fieldName), eq(entityTranslationsTable.languageCode, languageCode)))
            .limit(1);
        return result[0] || null;
    }
    /**
     * Get all translations for an entity across all languages and fields.
     */
    async findAllForEntity(entityType, entityId) {
        return this.db
            .select()
            .from(entityTranslationsTable)
            .where(and(eq(entityTranslationsTable.entityType, entityType), eq(entityTranslationsTable.entityId, entityId)));
    }
    /**
     * Get translations for multiple entities in bulk (for list responses).
     */
    async findBulkForEntities(entityType, entityIds, languageCode) {
        if (entityIds.length === 0)
            return [];
        return this.db
            .select()
            .from(entityTranslationsTable)
            .where(and(eq(entityTranslationsTable.entityType, entityType), inArray(entityTranslationsTable.entityId, entityIds), eq(entityTranslationsTable.languageCode, languageCode)));
    }
    /**
     * Upsert a single translation.
     */
    async upsert(data) {
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
                version: sql `${entityTranslationsTable.version} + 1`,
                updatedAt: now,
            },
        });
    }
    /**
     * Bulk upsert many translations at once.
     */
    async bulkUpsert(records) {
        if (records.length === 0)
            return;
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
                value: sql `excluded.value`,
                version: sql `${entityTranslationsTable.version} + 1`,
                updatedAt: now,
            },
        });
    }
    /**
     * Find entities that have an English translation but are missing the target language.
     * Returns up to 200 records for the admin to fill in.
     */
    async findMissing(languageCode, entityType) {
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
        if (enTranslations.length === 0)
            return [];
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
        const existingKeys = new Set(targetLanguageRecords.map(r => `${r.entityType}:${r.entityId}:${r.fieldName}`));
        // Return records that are missing in the target language
        const missing = enTranslations.filter(r => {
            if (entityType && r.entityType !== entityType)
                return false;
            const key = `${r.entityType}:${r.entityId}:${r.fieldName}`;
            return !existingKeys.has(key);
        });
        return missing.slice(0, 200);
    }
    /**
     * Append to audit log.
     */
    async addAuditLog(entry) {
        await this.db.insert(translationAuditLogTable).values({
            ...entry,
            createdAt: new Date(),
        });
    }
    async updateStatus(entityType, entityId, fieldName, languageCode, status, reviewedBy) {
        await this.db
            .update(entityTranslationsTable)
            .set({
            status,
            reviewedBy: reviewedBy ?? null,
            reviewedAt: reviewedBy ? new Date() : null,
            updatedAt: new Date(),
        })
            .where(and(eq(entityTranslationsTable.entityType, entityType), eq(entityTranslationsTable.entityId, entityId), eq(entityTranslationsTable.fieldName, fieldName), eq(entityTranslationsTable.languageCode, languageCode)));
    }
}

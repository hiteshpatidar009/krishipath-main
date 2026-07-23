import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
const TRANSLATION_TTL = 86400; // 24 hours in seconds
export class TranslationService extends BaseService {
    translationRepo;
    redisService;
    constructor(translationRepo, redisService) {
        super("TranslationService");
        this.translationRepo = translationRepo;
        this.redisService = redisService;
    }
    /**
     * Resolve a single field's translated value for an entity.
     * Fallback chain: requested lang → 'en' → "Translation Missing"
     */
    async resolveField(entityType, entityId, fieldName, languageCode) {
        const cacheKey = `etrans:${entityType}:${entityId}:${fieldName}:${languageCode}`;
        // 1. Check Redis cache
        const cached = await this.redisService.get(cacheKey);
        if (cached !== null)
            return cached;
        // 2. Try requested language
        const translation = await this.translationRepo.findOne(entityType, entityId, fieldName, languageCode);
        if (translation?.value) {
            await this.redisService.set(cacheKey, translation.value, TRANSLATION_TTL);
            return translation.value;
        }
        // 3. Fallback to English
        if (languageCode !== "en") {
            const enCacheKey = `etrans:${entityType}:${entityId}:${fieldName}:en`;
            const enCached = await this.redisService.get(enCacheKey);
            if (enCached !== null)
                return enCached;
            const enTranslation = await this.translationRepo.findOne(entityType, entityId, fieldName, "en");
            if (enTranslation?.value) {
                await this.redisService.set(enCacheKey, enTranslation.value, TRANSLATION_TTL);
                return enTranslation.value;
            }
        }
        // 4. Final fallback
        return "Translation Missing";
    }
    /**
     * Resolve multiple fields for a single entity at once.
     * Returns an object keyed by fieldName with resolved translated values.
     */
    async resolveEntity(entityType, entity, translatableFields, languageCode) {
        const entityId = entity.id;
        const resolved = { ...entity };
        await Promise.all(translatableFields.map(async (field) => {
            const translated = await this.resolveField(entityType, entityId, field, languageCode);
            // Only override if we got a real translation (not the English fallback value from DB)
            if (translated !== "Translation Missing") {
                resolved[field] = translated;
            }
        }));
        return resolved;
    }
    /**
     * Resolve translations for a list of entities in bulk (efficient for list APIs).
     */
    async resolveEntityList(entityType, entities, translatableFields, languageCode, idField = "id") {
        if (entities.length === 0 || translatableFields.length === 0)
            return entities;
        // Fast-path: English is the fallback, so we just return the entities as they are
        if (languageCode === "en")
            return entities;
        const entityIds = entities.map((e) => String(e[idField]));
        // Bulk fetch from DB for target language
        const translations = await this.translationRepo.findBulkForEntities(entityType, entityIds, languageCode);
        // Build lookup map: entityId:fieldName → value
        const translationMap = new Map();
        for (const t of translations) {
            translationMap.set(`${t.entityId}:${t.fieldName}`, t.value);
        }
        // Fallback: fetch English translations for any missing
        if (languageCode !== "en") {
            const enTranslations = await this.translationRepo.findBulkForEntities(entityType, entityIds, "en");
            for (const t of enTranslations) {
                const key = `${t.entityId}:${t.fieldName}`;
                if (!translationMap.has(key)) {
                    translationMap.set(key, t.value);
                }
            }
        }
        return entities.map((entity) => {
            const entityId = String(entity[idField]);
            const resolved = { ...entity };
            for (const field of translatableFields) {
                const translated = translationMap.get(`${entityId}:${field}`);
                if (translated) {
                    resolved[field] = translated;
                }
            }
            return resolved;
        });
    }
    /**
     * Upsert a single translation and invalidate its cache.
     */
    async upsert(data) {
        // Get existing value for audit log
        const existing = await this.translationRepo.findOne(data.entityType, data.entityId, data.fieldName, data.languageCode);
        const id = existing?.id ?? randomUUID();
        await this.translationRepo.upsert({ id, ...data });
        // Write to audit log
        await this.translationRepo.addAuditLog({
            id: randomUUID(),
            translationId: id,
            entityType: data.entityType,
            entityId: data.entityId,
            fieldName: data.fieldName,
            languageCode: data.languageCode,
            oldValue: existing?.value ?? null,
            newValue: data.value,
            action: existing ? "UPDATED" : "CREATED",
            changedBy: data.translatedBy ?? null,
        });
        // Invalidate Redis cache
        await this.invalidateCache(data.entityType, data.entityId, data.fieldName, data.languageCode);
        return this.translationRepo.findOne(data.entityType, data.entityId, data.fieldName, data.languageCode);
    }
    /**
     * Bulk upsert many translations (for import jobs).
     */
    async bulkUpsert(records) {
        const withIds = records.map((r) => ({ id: randomUUID(), ...r }));
        await this.translationRepo.bulkUpsert(withIds);
        // Bulk cache invalidation
        await Promise.all(records.map((r) => this.invalidateCache(r.entityType, r.entityId, r.fieldName, r.languageCode)));
    }
    /**
     * Get all translations for an entity (for admin translation center).
     */
    async getEntityTranslations(entityType, entityId) {
        return this.translationRepo.findAllForEntity(entityType, entityId);
    }
    /**
     * Update translation status (approve/reject).
     */
    async updateStatus(entityType, entityId, fieldName, languageCode, status, reviewedBy) {
        await this.translationRepo.updateStatus(entityType, entityId, fieldName, languageCode, status, reviewedBy);
        await this.invalidateCache(entityType, entityId, fieldName, languageCode);
    }
    /**
     * Get all entities missing translations for a specific language.
     * Used by Translation Center admin to know what still needs translating.
     */
    async getMissingTranslations(languageCode, entityType) {
        return this.translationRepo.findMissing(languageCode, entityType);
    }
    async invalidateCache(entityType, entityId, fieldName, languageCode) {
        const cacheKey = `etrans:${entityType}:${entityId}:${fieldName}:${languageCode}`;
        await this.redisService.del(cacheKey);
    }
}

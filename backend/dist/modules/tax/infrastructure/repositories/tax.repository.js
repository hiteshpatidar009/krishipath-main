import { randomUUID } from "crypto";
import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { Db2Connection } from "../../../../infrastructure/database/postgres/connections/db2.connection";
import { TaxProfileOwnerType, TaxRuleStatus } from "../../constants/tax.constants";
import { taxCalculationSnapshotsTable, taxJurisdictionsTable, taxProfilesTable, taxRulesTable, } from "../../schemas/tax.schema";
export class TaxRepository {
    db;
    constructor(db) {
        this.db = db ?? Db2Connection.getInstance();
    }
    async transaction(callback) {
        return this.db.transaction(async (tx) => callback(new TaxRepository(tx)));
    }
    async createJurisdiction(record) {
        const now = new Date();
        const [created] = await this.db.insert(taxJurisdictionsTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async findJurisdictionByCode(companyId, jurisdictionCode) {
        const [record] = await this.db
            .select()
            .from(taxJurisdictionsTable)
            .where(and(eq(taxJurisdictionsTable.jurisdictionCode, jurisdictionCode), eq(taxJurisdictionsTable.isActive, true), or(eq(taxJurisdictionsTable.companyId, companyId), isNull(taxJurisdictionsTable.companyId))))
            .limit(1);
        return record ?? null;
    }
    async createRule(record) {
        const now = new Date();
        const [created] = await this.db.insert(taxRulesTable).values({
            ...record,
            id: randomUUID(),
            version: 1,
            deactivatedAt: null,
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async listRules(companyId, query) {
        const offset = (query.page - 1) * query.limit;
        const where = and(or(eq(taxRulesTable.companyId, companyId), isNull(taxRulesTable.companyId)), query.status ? eq(taxRulesTable.status, query.status) : undefined, query.jurisdictionCode ? eq(taxRulesTable.jurisdictionCode, query.jurisdictionCode) : undefined, query.taxCategory ? eq(taxRulesTable.taxCategory, query.taxCategory) : undefined, query.scopeLevel ? eq(taxRulesTable.scopeLevel, query.scopeLevel) : undefined, query.search ? or(ilike(taxRulesTable.ruleName, `%${query.search}%`), ilike(taxRulesTable.ruleCode, `%${query.search}%`)) : undefined);
        const [countRecord] = await this.db.select({ count: sql `count(*)::int` }).from(taxRulesTable).where(where);
        const records = await this.db.select().from(taxRulesTable).where(where).orderBy(desc(taxRulesTable.updatedAt)).limit(query.limit).offset(offset);
        return {
            items: records,
            page: query.page,
            limit: query.limit,
            total: Number(countRecord?.count ?? 0),
        };
    }
    async findRuleById(companyId, id) {
        const [record] = await this.db
            .select()
            .from(taxRulesTable)
            .where(and(eq(taxRulesTable.id, id), or(eq(taxRulesTable.companyId, companyId), isNull(taxRulesTable.companyId))))
            .limit(1);
        return record ?? null;
    }
    async findRulesByIds(companyId, ids) {
        if (ids.length === 0)
            return [];
        const records = await this.db
            .select()
            .from(taxRulesTable)
            .where(and(sql `${taxRulesTable.id} = any(${ids})`, or(eq(taxRulesTable.companyId, companyId), isNull(taxRulesTable.companyId))));
        return records;
    }
    async findApplicableRules(input) {
        const records = await this.db
            .select()
            .from(taxRulesTable)
            .where(and(eq(taxRulesTable.status, TaxRuleStatus.Active), lte(taxRulesTable.effectiveFrom, input.effectiveDate), or(isNull(taxRulesTable.effectiveTo), gte(taxRulesTable.effectiveTo, input.effectiveDate)), or(eq(taxRulesTable.companyId, input.companyId), isNull(taxRulesTable.companyId)), or(eq(taxRulesTable.organizationId, input.organizationId ?? "00000000-0000-0000-0000-000000000000"), isNull(taxRulesTable.organizationId)), or(eq(taxRulesTable.jurisdictionCode, input.jurisdictionCode), eq(taxRulesTable.jurisdictionCode, "GLOBAL")), or(sql `${taxRulesTable.taxCategory} = any(${input.taxCategories})`, eq(taxRulesTable.taxCategory, "GENERAL")), or(eq(taxRulesTable.appliesTo, input.appliesTo), eq(taxRulesTable.appliesTo, "ALL"))))
            .orderBy(taxRulesTable.priority, desc(taxRulesTable.scopeLevel));
        return records;
    }
    async updateRule(companyId, id, patch) {
        const [record] = await this.db
            .update(taxRulesTable)
            .set({ ...patch, updatedAt: new Date(), version: sql `${taxRulesTable.version} + 1` })
            .where(and(eq(taxRulesTable.id, id), eq(taxRulesTable.companyId, companyId)))
            .returning();
        return record ?? null;
    }
    async deactivateRule(companyId, id, userId) {
        const now = new Date();
        const [record] = await this.db
            .update(taxRulesTable)
            .set({
            status: TaxRuleStatus.Inactive,
            effectiveTo: now,
            deactivatedAt: now,
            updatedAt: now,
            updatedBy: userId,
            version: sql `${taxRulesTable.version} + 1`,
        })
            .where(and(eq(taxRulesTable.id, id), eq(taxRulesTable.companyId, companyId)))
            .returning();
        return record ?? null;
    }
    async upsertProfile(record) {
        const existing = await this.findProfile(record.companyId, record.ownerType, record.ownerId);
        const now = new Date();
        if (existing) {
            const [updated] = await this.db
                .update(taxProfilesTable)
                .set({ ...record, updatedAt: now, version: sql `${taxProfilesTable.version} + 1` })
                .where(eq(taxProfilesTable.id, existing.id))
                .returning();
            return updated;
        }
        const [created] = await this.db.insert(taxProfilesTable).values({
            ...record,
            id: randomUUID(),
            version: 1,
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async findProfile(companyId, ownerType, ownerId) {
        const [record] = await this.db
            .select()
            .from(taxProfilesTable)
            .where(and(eq(taxProfilesTable.companyId, companyId), eq(taxProfilesTable.ownerType, ownerType), eq(taxProfilesTable.ownerId, ownerId)))
            .limit(1);
        return record ?? null;
    }
    async findProfiles(input) {
        const filters = [
            input.organizationId ? and(eq(taxProfilesTable.ownerType, TaxProfileOwnerType.Organization), eq(taxProfilesTable.ownerId, input.organizationId)) : undefined,
            input.customerId ? and(eq(taxProfilesTable.ownerType, TaxProfileOwnerType.Customer), eq(taxProfilesTable.ownerId, input.customerId)) : undefined,
            input.supplierId ? and(eq(taxProfilesTable.ownerType, TaxProfileOwnerType.Supplier), eq(taxProfilesTable.ownerId, input.supplierId)) : undefined,
        ].filter(Boolean);
        if (filters.length === 0)
            return [];
        const records = await this.db
            .select()
            .from(taxProfilesTable)
            .where(and(eq(taxProfilesTable.companyId, input.companyId), or(...filters)));
        return records;
    }
    async createSnapshot(result, calculatedBy) {
        const id = randomUUID();
        const [created] = await this.db.insert(taxCalculationSnapshotsTable).values({
            id,
            companyId: result.companyId,
            organizationId: result.organizationId ?? null,
            sourceModule: result.sourceModule,
            sourceEntityType: result.sourceEntityType ?? null,
            sourceEntityId: result.sourceEntityId ?? null,
            calculationHash: result.calculationHash,
            currencyCode: result.currencyCode,
            taxableAmount: result.taxableAmount,
            taxAmount: result.taxAmount,
            totalAmount: result.totalAmount,
            jurisdictionCode: result.jurisdictionCode,
            ruleVersionSnapshot: result.ruleVersionSnapshot,
            breakdown: { lines: result.lines },
            inputSnapshot: result.inputSnapshot,
            effectiveDate: result.effectiveDate,
            calculatedBy,
            createdAt: new Date(),
        }).returning();
        return {
            ...created,
            calculationId: id,
            lines: result.lines,
        };
    }
    async findSnapshotById(companyId, id) {
        const [record] = await this.db
            .select()
            .from(taxCalculationSnapshotsTable)
            .where(and(eq(taxCalculationSnapshotsTable.companyId, companyId), eq(taxCalculationSnapshotsTable.id, id)))
            .limit(1);
        if (!record)
            return null;
        const snapshot = record;
        return {
            ...snapshot,
            calculationId: snapshot.id,
            lines: snapshot.breakdown?.lines ?? [],
        };
    }
}

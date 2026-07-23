import { eq, and, ilike, desc, count, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { mandisTable, statesTable, districtsTable, mandiDuplicateJobsTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class MandiAdminRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findAllPaginated(params) {
        console.log("findAllPaginated params:", params);
        const offset = (params.page - 1) * params.limit;
        const conditions = [];
        if (params.search) {
            conditions.push(ilike(mandisTable.name, `%${params.search}%`));
        }
        if (params.stateId)
            conditions.push(eq(mandisTable.stateId, params.stateId));
        if (params.districtId)
            conditions.push(eq(mandisTable.districtId, params.districtId));
        if (params.status)
            conditions.push(eq(mandisTable.status, params.status));
        const where = conditions.length > 0 ? and(...conditions) : undefined;
        const [mandis, totals] = await Promise.all([
            this.db
                .select({
                id: mandisTable.id,
                code: mandisTable.code,
                slug: mandisTable.slug,
                name: mandisTable.name,
                address: mandisTable.address,
                latitude: mandisTable.latitude,
                longitude: mandisTable.longitude,
                status: mandisTable.status,
                openingTime: mandisTable.openingTime,
                closingTime: mandisTable.closingTime,
                workingDays: mandisTable.workingDays,
                defaultUnit: mandisTable.defaultUnit,
                currency: mandisTable.currency,
                aiPredictionEnabled: mandisTable.aiPredictionEnabled,
                notificationsEnabled: mandisTable.notificationsEnabled,
                priceVisibility: mandisTable.priceVisibility,
                analyticsEnabled: mandisTable.analyticsEnabled,
                createdAt: mandisTable.createdAt,
                updatedAt: mandisTable.updatedAt,
                stateId: mandisTable.stateId,
                stateName: statesTable.name,
                districtId: mandisTable.districtId,
                districtName: districtsTable.name,
            })
                .from(mandisTable)
                .innerJoin(statesTable, eq(mandisTable.stateId, statesTable.id))
                .innerJoin(districtsTable, eq(mandisTable.districtId, districtsTable.id))
                .where(where)
                .orderBy(desc(mandisTable.createdAt))
                .limit(params.limit)
                .offset(offset),
            this.db
                .select({ count: count() })
                .from(mandisTable)
                .where(where),
        ]);
        return { mandis, total: Number(totals[0]?.count ?? 0) };
    }
    async findByIdFull(id) {
        const result = await this.db
            .select()
            .from(mandisTable)
            .where(eq(mandisTable.id, id))
            .limit(1);
        return result[0] || null;
    }
    async create(data) {
        const now = new Date();
        await this.db.insert(mandisTable).values({
            ...data,
            status: "ACTIVE",
            createdAt: now,
            updatedAt: now,
        });
        return this.findByIdFull(data.id);
    }
    async update(id, data) {
        await this.db
            .update(mandisTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(mandisTable.id, id));
        return this.findByIdFull(id);
    }
    async archive(id) {
        await this.db
            .update(mandisTable)
            .set({ status: "ARCHIVED", archivedAt: new Date(), updatedAt: new Date() })
            .where(eq(mandisTable.id, id));
    }
    async getNextCode() {
        const result = await this.db
            .select({ code: mandisTable.code })
            .from(mandisTable)
            .where(sql `${mandisTable.code} LIKE 'MANDI_%'`)
            .orderBy(desc(mandisTable.code))
            .limit(1);
        const last = result[0]?.code;
        if (!last)
            return "MANDI_000001";
        const num = parseInt(last.replace("MANDI_", ""), 10);
        return `MANDI_${String(num + 1).padStart(6, "0")}`;
    }
    // Duplicate job tracking
    async createDuplicateJob(data) {
        const now = new Date();
        await this.db.insert(mandiDuplicateJobsTable).values({
            id: data.id,
            sourceMandiId: data.sourceMandiId,
            targetMandiId: null,
            targetName: data.targetName,
            copyOptions: data.copyOptions,
            status: "PENDING",
            createdBy: data.createdBy,
            createdAt: now,
        });
    }
    async updateDuplicateJob(id, data) {
        await this.db
            .update(mandiDuplicateJobsTable)
            .set(data)
            .where(eq(mandiDuplicateJobsTable.id, id));
    }
}

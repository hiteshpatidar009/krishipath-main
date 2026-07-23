import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { marketInsightsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class MarketInsightRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async getActiveInsight(productId, mandiId) {
        if (mandiId) {
            const exact = await this.db
                .select()
                .from(marketInsightsTable)
                .where(and(eq(marketInsightsTable.productId, productId), eq(marketInsightsTable.mandiId, mandiId), eq(marketInsightsTable.status, "PUBLISHED"), gt(marketInsightsTable.expiresAt, new Date())))
                .orderBy(desc(marketInsightsTable.publishAt), desc(marketInsightsTable.updatedAt))
                .limit(1);
            if (exact[0])
                return exact[0];
        }
        // Fall back to a published broader-scope insight for the same product.
        const results = await this.db
            .select()
            .from(marketInsightsTable)
            .where(and(eq(marketInsightsTable.productId, productId), isNull(marketInsightsTable.mandiId), eq(marketInsightsTable.status, "PUBLISHED"), gt(marketInsightsTable.expiresAt, new Date())))
            .orderBy(desc(marketInsightsTable.publishAt), desc(marketInsightsTable.updatedAt))
            .limit(1);
        return results[0] || null;
    }
    async findById(id) {
        const rows = await this.db
            .select()
            .from(marketInsightsTable)
            .where(eq(marketInsightsTable.id, id))
            .limit(1);
        return rows[0] || null;
    }
    async listAdmin(filters = {}) {
        const conditions = [];
        if (filters.productId)
            conditions.push(eq(marketInsightsTable.productId, filters.productId));
        if (filters.mandiId)
            conditions.push(eq(marketInsightsTable.mandiId, filters.mandiId));
        if (filters.status)
            conditions.push(eq(marketInsightsTable.status, filters.status));
        const base = this.db.select().from(marketInsightsTable);
        return conditions.length
            ? base.where(and(...conditions)).orderBy(desc(marketInsightsTable.updatedAt))
            : base.orderBy(desc(marketInsightsTable.updatedAt));
    }
    async create(data) {
        const rows = await this.db.insert(marketInsightsTable).values(data).returning();
        return rows[0];
    }
    async update(id, patch) {
        const rows = await this.db
            .update(marketInsightsTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(eq(marketInsightsTable.id, id))
            .returning();
        return rows[0] || null;
    }
}

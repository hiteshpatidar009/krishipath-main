import { eq, and } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { languagesTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class LanguageRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findAll(activeOnly = false) {
        const query = this.db
            .select()
            .from(languagesTable)
            .orderBy(languagesTable.sortOrder);
        if (activeOnly) {
            return this.db
                .select()
                .from(languagesTable)
                .where(eq(languagesTable.isActive, true))
                .orderBy(languagesTable.sortOrder);
        }
        return query;
    }
    async findByCode(code) {
        const result = await this.db
            .select()
            .from(languagesTable)
            .where(eq(languagesTable.code, code))
            .limit(1);
        return result[0] || null;
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(languagesTable)
            .where(eq(languagesTable.id, id))
            .limit(1);
        return result[0] || null;
    }
    async findDefault() {
        const result = await this.db
            .select()
            .from(languagesTable)
            .where(and(eq(languagesTable.isDefault, true), eq(languagesTable.isActive, true)))
            .limit(1);
        return result[0] || null;
    }
    async create(data) {
        const now = new Date();
        await this.db.insert(languagesTable).values({
            ...data,
            isRtl: data.isRtl ?? false,
            isActive: data.isActive ?? true,
            isDefault: data.isDefault ?? false,
            sortOrder: data.sortOrder ?? 0,
            createdAt: now,
            updatedAt: now,
        });
        return this.findById(data.id);
    }
    async update(id, data) {
        await this.db
            .update(languagesTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(languagesTable.id, id));
        return this.findById(id);
    }
    async clearDefault() {
        await this.db
            .update(languagesTable)
            .set({ isDefault: false, updatedAt: new Date() })
            .where(eq(languagesTable.isDefault, true));
    }
}

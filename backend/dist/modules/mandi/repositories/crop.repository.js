import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { cropsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class CropRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findAll() {
        return this.db.select().from(cropsTable);
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(cropsTable)
            .where(eq(cropsTable.id, id))
            .limit(1);
        return result[0] || null;
    }
    async create(data) {
        const result = await this.db
            .insert(cropsTable)
            .values(data)
            .returning();
        return result[0];
    }
    async update(id, data) {
        const result = await this.db
            .update(cropsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(cropsTable.id, id))
            .returning();
        return result[0] || null;
    }
}

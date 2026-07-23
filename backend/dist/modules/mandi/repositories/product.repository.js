import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { productsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class ProductRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findAll() {
        return this.db.select().from(productsTable);
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, id))
            .limit(1);
        return result[0] || null;
    }
    async create(data) {
        const result = await this.db
            .insert(productsTable)
            .values(data)
            .returning();
        return result[0];
    }
    async update(id, data) {
        const result = await this.db
            .update(productsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(productsTable.id, id))
            .returning();
        return result[0] || null;
    }
}

import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { tradersTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class TraderRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findByUserId(userId) {
        const result = await this.db
            .select()
            .from(tradersTable)
            .where(eq(tradersTable.userId, userId))
            .limit(1);
        return result[0] || null;
    }
}

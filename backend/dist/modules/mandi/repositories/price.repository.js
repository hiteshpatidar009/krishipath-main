import { eq, and } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { traderMandiPricesTable, mandiPriceHistoryTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class PriceRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async getActivePricesForMandi(mandiId) {
        return this.db
            .select()
            .from(traderMandiPricesTable)
            .where(eq(traderMandiPricesTable.mandiId, mandiId));
    }
    async getActivePricesForMandiAndVariant(mandiId, variantId) {
        return this.db
            .select()
            .from(traderMandiPricesTable)
            .where(and(eq(traderMandiPricesTable.mandiId, mandiId), eq(traderMandiPricesTable.variantId, variantId)));
    }
    async upsertPrice(traderId, mandiId, variantId, pricePerQuintal, updatedBy) {
        // Upsert the current price
        await this.db
            .insert(traderMandiPricesTable)
            .values({
            id: crypto.randomUUID(),
            traderId,
            mandiId,
            variantId,
            pricePerQuintal,
            updatedBy,
        })
            .onConflictDoUpdate({
            target: [
                traderMandiPricesTable.traderId,
                traderMandiPricesTable.mandiId,
                traderMandiPricesTable.variantId,
            ],
            set: {
                pricePerQuintal,
                updatedBy,
                updatedAt: new Date(),
            },
        });
    }
    async recordHistory(traderId, mandiId, variantId, pricePerQuintal, updatedBy) {
        await this.db.insert(mandiPriceHistoryTable).values({
            id: crypto.randomUUID(),
            traderId,
            mandiId,
            variantId,
            pricePerQuintal,
            updatedBy,
        });
    }
}

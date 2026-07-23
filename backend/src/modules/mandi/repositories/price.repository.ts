import { eq, and } from "drizzle-orm";

import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  traderMandiPricesTable,
  mandiPriceHistoryTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class PriceRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async getActivePricesForMandi(mandiId: string) {
    return this.db
      .select()
      .from(traderMandiPricesTable)
      .where(eq(traderMandiPricesTable.mandiId, mandiId));
  }

  public async getActivePricesForMandiAndVariant(mandiId: string, variantId: string) {
    return this.db
      .select()
      .from(traderMandiPricesTable)
      .where(
        and(
          eq(traderMandiPricesTable.mandiId, mandiId),
          eq(traderMandiPricesTable.variantId, variantId),
        ),
      );
  }

  public async upsertPrice(
    traderId: string,
    mandiId: string,
    variantId: string,
    pricePerQuintal: string,
    updatedBy: string,
  ) {
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

  public async recordHistory(
    traderId: string | null,
    mandiId: string,
    variantId: string,
    pricePerQuintal: string,
    updatedBy: string,
  ) {
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

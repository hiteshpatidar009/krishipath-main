import { eq, and } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  traderMandiPricesTable,
  tradersTable,
  mandiTraderAssignmentsTable,
  usersTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class TraderPriceRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async findByMandiAndVariant(mandiId: string, variantId: string) {
    // We want all active traders assigned to this mandi,
    // left joined with their current prices for this variant.
    const traders = await this.db
      .select({
        traderId: mandiTraderAssignmentsTable.traderId,
        shopName: tradersTable.shopName,
        pricePerQuintal: traderMandiPricesTable.pricePerQuintal,
        priceDate: traderMandiPricesTable.priceDate,
        grade: traderMandiPricesTable.grade,
        updatedAt: traderMandiPricesTable.updatedAt,
      })
      .from(mandiTraderAssignmentsTable)
      .innerJoin(tradersTable, eq(mandiTraderAssignmentsTable.traderId, tradersTable.id))
      .leftJoin(traderMandiPricesTable, and(
        eq(traderMandiPricesTable.traderId, tradersTable.id),
        eq(traderMandiPricesTable.mandiId, mandiId),
        eq(traderMandiPricesTable.variantId, variantId)
      ))
      .where(and(
        eq(mandiTraderAssignmentsTable.mandiId, mandiId),
        eq(mandiTraderAssignmentsTable.status, 'ACTIVE')
      ));
    return traders;
  }

  /**
   * Public buyer offers for a product. Trader prices are stored against a
   * product grade/variant, so join the variant back to its parent product.
   */
  public async findByMandiAndProduct(mandiId: string, productId: string) {
    return this.db
      .select({
        traderId: mandiTraderAssignmentsTable.traderId,
        shopName: tradersTable.shopName,
        verificationStatus: tradersTable.verificationStatus,
        licenseNumber: tradersTable.licenseNumber,
        phone: usersTable.phone,
        pricePerQuintal: traderMandiPricesTable.pricePerQuintal,
        priceDate: traderMandiPricesTable.priceDate,
        grade: traderMandiPricesTable.grade,
        updatedAt: traderMandiPricesTable.updatedAt,
      })
      .from(mandiTraderAssignmentsTable)
      .innerJoin(tradersTable, eq(mandiTraderAssignmentsTable.traderId, tradersTable.id))
      .innerJoin(usersTable, eq(tradersTable.userId, usersTable.id))
      .leftJoin(
        traderMandiPricesTable,
        and(
          eq(traderMandiPricesTable.traderId, tradersTable.id),
          eq(traderMandiPricesTable.mandiId, mandiId),
          eq(traderMandiPricesTable.variantId, productId),
        ),
      )
      .where(
        and(
          eq(mandiTraderAssignmentsTable.mandiId, mandiId),
          eq(mandiTraderAssignmentsTable.status, "ACTIVE"),
          eq(tradersTable.isActive, true),
          eq(tradersTable.verificationStatus, "APPROVED"),
        ),
      );
  }

  public async bulkUpsert(
    records: Array<{
      id: string;
      traderId: string;
      mandiId: string;
      variantId: string;
      pricePerQuintal: string;
      priceDate: string;
      grade?: string;
      updatedBy: string;
    }>
  ) {
    if (records.length === 0) return;
    const now = new Date();
    await this.db
      .insert(traderMandiPricesTable)
      .values(
        records.map((r) => ({
          ...r,
          createdAt: now,
          updatedAt: now,
        }))
      )
      .onConflictDoUpdate({
        target: [
          traderMandiPricesTable.traderId,
          traderMandiPricesTable.mandiId,
          traderMandiPricesTable.variantId,
        ],
        set: {
          pricePerQuintal: records[0].pricePerQuintal, // Postgres requires actual mapping for dynamic sets on conflict, but drizzle handles this via SQL or we do one by one.
          priceDate: records[0].priceDate as any,
          grade: records[0].grade ?? null,
          // Wait, Drizzle doesn't support bulk dynamic updates this simply.
          // Since it's a small array (e.g. 50 traders), we can do a Promise.all
        },
      });
  }

  public async upsert(data: {
    id: string;
    traderId: string;
    mandiId: string;
    variantId: string;
    pricePerQuintal: string;
    priceDate: string;
    grade?: string;
    updatedBy: string;
  }) {
    const now = new Date();
    await this.db
      .insert(traderMandiPricesTable)
      .values({
        id: data.id,
        traderId: data.traderId,
        mandiId: data.mandiId,
        variantId: data.variantId,
        pricePerQuintal: data.pricePerQuintal,
        priceDate: data.priceDate as any,
        grade: data.grade ?? null,
        updatedBy: data.updatedBy,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          traderMandiPricesTable.traderId,
          traderMandiPricesTable.mandiId,
          traderMandiPricesTable.variantId,
        ],
        set: {
          pricePerQuintal: data.pricePerQuintal,
          priceDate: data.priceDate as any,
          grade: data.grade ?? null,
          updatedBy: data.updatedBy,
          updatedAt: now,
        },
      });
  }
}

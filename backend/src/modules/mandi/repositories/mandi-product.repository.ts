import { eq, and, inArray } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  mandiProductsTable,
  productsTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class MandiProductRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async findByMandi(mandiId: string) {
    return this.db
      .select({
        id: mandiProductsTable.id,
        mandiId: mandiProductsTable.mandiId,
        productId: mandiProductsTable.productId,
        cropCode: productsTable.code,
        cropName: productsTable.name,
        cropCategory: productsTable.category,
        cropImageUrl: productsTable.imageUrl,
        cropStatus: productsTable.status,
        isEnabled: mandiProductsTable.isEnabled,
        priceInitStrategy: mandiProductsTable.priceInitStrategy,
        enabledAt: mandiProductsTable.enabledAt,
        disabledAt: mandiProductsTable.disabledAt,
      })
      .from(mandiProductsTable)
      .innerJoin(productsTable, eq(mandiProductsTable.productId, productsTable.id))
      .where(eq(mandiProductsTable.mandiId, mandiId));
  }

  public async findEnabledByMandi(mandiId: string) {
    return this.db
      .select({
        id: mandiProductsTable.id,
        productId: mandiProductsTable.productId,
        cropCode: productsTable.code,
        cropName: productsTable.name,
        cropCategory: productsTable.category,
        cropImageUrl: productsTable.imageUrl,
      })
      .from(mandiProductsTable)
      .innerJoin(productsTable, eq(mandiProductsTable.productId, productsTable.id))
      .where(
        and(
          eq(mandiProductsTable.mandiId, mandiId),
          eq(mandiProductsTable.isEnabled, true),
          eq(productsTable.status, "ACTIVE"),
        ),
      );
  }

  public async findOne(mandiId: string, productId: string) {
    const result = await this.db
      .select()
      .from(mandiProductsTable)
      .where(and(eq(mandiProductsTable.mandiId, mandiId), eq(mandiProductsTable.productId, productId)))
      .limit(1);
    return result[0] || null;
  }

  public async upsert(data: {
    id: string;
    mandiId: string;
    productId: string;
    isEnabled: boolean;
    priceInitStrategy?: string;
    sourcePriceMandiId?: string | null;
  }) {
    const now = new Date();
    await this.db
      .insert(mandiProductsTable)
      .values({
        id: data.id,
        mandiId: data.mandiId,
        productId: data.productId,
        isEnabled: data.isEnabled,
        priceInitStrategy: data.priceInitStrategy ?? "EMPTY",
        sourcePriceMandiId: data.sourcePriceMandiId ?? null,
        enabledAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [mandiProductsTable.mandiId, mandiProductsTable.productId],
        set: {
          isEnabled: data.isEnabled,
          priceInitStrategy: data.priceInitStrategy ?? "EMPTY",
          sourcePriceMandiId: data.sourcePriceMandiId ?? null,
          disabledAt: data.isEnabled ? null : now,
          updatedAt: now,
        },
      });
  }

  public async bulkInsert(
    records: Array<{
      id: string;
      mandiId: string;
      productId: string;
      isEnabled: boolean;
      priceInitStrategy?: string;
    }>,
  ) {
    if (records.length === 0) return;
    const now = new Date();
    await this.db.insert(mandiProductsTable).values(
      records.map((r) => ({
        ...r,
        priceInitStrategy: r.priceInitStrategy ?? "EMPTY",
        enabledAt: now,
        createdAt: now,
        updatedAt: now,
      })),
    ).onConflictDoNothing();
  }

  public async getMandiIdsForCrop(productId: string): Promise<string[]> {
    const result = await this.db
      .select({ mandiId: mandiProductsTable.mandiId })
      .from(mandiProductsTable)
      .where(and(eq(mandiProductsTable.productId, productId), eq(mandiProductsTable.isEnabled, true)));
    return result.map((r) => r.mandiId);
  }
}

import { eq, and, desc, gte, inArray } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  officialMandiPricesTable,
  productsTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class MandiPriceRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async findLatestByMandi(mandiId: string) {
    return this.db
      .select({
        id: officialMandiPricesTable.id,
        mandiId: officialMandiPricesTable.mandiId,
        variantId: officialMandiPricesTable.cropId,
        cropId: officialMandiPricesTable.cropId,
        cropCode: productsTable.code,
        cropName: productsTable.name,
        cropCategory: productsTable.category,
        grade: officialMandiPricesTable.grade,
        unit: officialMandiPricesTable.unit,
        priceMin: officialMandiPricesTable.priceMin,
        priceMax: officialMandiPricesTable.priceMax,
        priceModal: officialMandiPricesTable.priceModal,
        priceDate: officialMandiPricesTable.priceDate,
        arrivalQuantity: officialMandiPricesTable.arrivalQuantity,
        arrivalUnit: officialMandiPricesTable.arrivalUnit,
        source: officialMandiPricesTable.source,
        updatedAt: officialMandiPricesTable.updatedAt,
      })
      .from(officialMandiPricesTable)
      .innerJoin(productsTable, eq(officialMandiPricesTable.cropId, productsTable.id))
      .where(eq(officialMandiPricesTable.mandiId, mandiId))
      .orderBy(desc(officialMandiPricesTable.priceDate));
  }

  /** Official price history used by the farmer-facing mandi charts. */
  public async findHistoryByMandi(mandiId: string, days: number = 30) {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - Math.max(1, Math.min(days, 90)));
    const fromDate = from.toISOString().slice(0, 10);

    return this.db
      .select({
        id: officialMandiPricesTable.id,
        mandiId: officialMandiPricesTable.mandiId,
        cropId: officialMandiPricesTable.cropId,
        cropCode: productsTable.code,
        cropName: productsTable.name,
        grade: officialMandiPricesTable.grade,
        unit: officialMandiPricesTable.unit,
        priceMin: officialMandiPricesTable.priceMin,
        priceMax: officialMandiPricesTable.priceMax,
        priceModal: officialMandiPricesTable.priceModal,
        priceDate: officialMandiPricesTable.priceDate,
        arrivalQuantity: officialMandiPricesTable.arrivalQuantity,
        arrivalUnit: officialMandiPricesTable.arrivalUnit,
        source: officialMandiPricesTable.source,
        updatedAt: officialMandiPricesTable.updatedAt,
      })
      .from(officialMandiPricesTable)
      .innerJoin(productsTable, eq(officialMandiPricesTable.cropId, productsTable.id))
      .where(
        and(
          eq(officialMandiPricesTable.mandiId, mandiId),
          gte(officialMandiPricesTable.priceDate, fromDate as any),
        ),
      )
      .orderBy(desc(officialMandiPricesTable.priceDate));
  }

  /** Latest rows for a product across a set of mandis (used for comparison). */
  public async findByProductAcrossMandis(productId: string, mandiIds: string[]) {
    if (mandiIds.length === 0) return [];
    return this.db
      .select({
        mandiId: officialMandiPricesTable.mandiId,
        cropId: officialMandiPricesTable.cropId,
        grade: officialMandiPricesTable.grade,
        unit: officialMandiPricesTable.unit,
        priceMin: officialMandiPricesTable.priceMin,
        priceMax: officialMandiPricesTable.priceMax,
        priceModal: officialMandiPricesTable.priceModal,
        priceDate: officialMandiPricesTable.priceDate,
        arrivalQuantity: officialMandiPricesTable.arrivalQuantity,
        arrivalUnit: officialMandiPricesTable.arrivalUnit,
        source: officialMandiPricesTable.source,
      })
      .from(officialMandiPricesTable)
      .where(
        and(
          eq(officialMandiPricesTable.cropId, productId),
          inArray(officialMandiPricesTable.mandiId, mandiIds),
        ),
      )
      .orderBy(desc(officialMandiPricesTable.priceDate));
  }

  public async findOne(mandiId: string, variantId: string, priceDate: string) {
    const result = await this.db
      .select()
      .from(officialMandiPricesTable)
      .where(
        and(
          eq(officialMandiPricesTable.mandiId, mandiId),
          eq(officialMandiPricesTable.cropId, variantId),
          eq(officialMandiPricesTable.priceDate, priceDate as any),
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  public async upsert(data: {
    id: string;
    mandiId: string;
    variantId: string;
    priceMin?: string;
    priceMax?: string;
    priceModal: string;
    priceDate: string;
    arrivalQuantity?: string;
    arrivalUnit?: string;
    source?: string;
    grade?: string;
    unit?: string;
    setBy?: string;
  }) {
    const now = new Date();
    await this.db
      .insert(officialMandiPricesTable)
      .values({
        id: data.id,
        mandiId: data.mandiId,
        cropId: data.variantId,
        priceMin: data.priceMin ?? null,
        priceMax: data.priceMax ?? null,
        priceModal: data.priceModal,
        priceDate: data.priceDate as any,
        arrivalQuantity: data.arrivalQuantity ?? null,
        arrivalUnit: data.arrivalUnit ?? null,
        source: data.source ?? "ADMIN",
        grade: data.grade ?? null,
        unit: data.unit ?? "QUINTAL",
        setBy: data.setBy ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          officialMandiPricesTable.mandiId,
          officialMandiPricesTable.cropId,
          officialMandiPricesTable.priceDate,
        ],
        set: {
          priceMin: data.priceMin ?? null,
          priceMax: data.priceMax ?? null,
          priceModal: data.priceModal,
          arrivalQuantity: data.arrivalQuantity ?? null,
          arrivalUnit: data.arrivalUnit ?? null,
          source: data.source ?? "ADMIN",
          grade: data.grade ?? null,
          unit: data.unit ?? "QUINTAL",
          setBy: data.setBy ?? null,
          updatedAt: now,
        },
      });
  }

  public async bulkInsert(
    records: Array<{
      id: string;
      mandiId: string;
      variantId: string;
      priceModal: string;
      priceDate: string;
      arrivalQuantity?: string;
      arrivalUnit?: string;
      priceMin?: string;
      priceMax?: string;
      grade?: string;
      unit?: string;
      setBy?: string;
      source?: string;
    }>,
  ) {
    if (records.length === 0) return;
    // Use the single-record upsert so every conflicting row keeps its own
    // values; a multi-row INSERT cannot safely reference per-row values here.
    for (const record of records) {
      await this.upsert(record);
    }
  }
}

import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  productClassificationsTable,
  productClassificationVariantsTable,
  productAliasesTable,
  productMandiAssignmentsTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class ProductExtrasRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  // ── Classifications ─────────────────────────────────────────────────────────

  public async findClassificationsByProduct(productId: string) {
    return this.db
      .select()
      .from(productClassificationsTable)
      .where(eq(productClassificationsTable.productId, productId));
  }

  public async createClassification(data: {
    productId: string;
    name: string;
    minPrice?: string;
    maxPrice?: string;
    unitId?: string;
    sortOrder?: number;
  }) {
    const [row] = await this.db
      .insert(productClassificationsTable)
      .values({ id: randomUUID(), ...data })
      .returning();
    return row;
  }

  public async updateClassification(id: string, data: Partial<typeof productClassificationsTable.$inferInsert>) {
    const [row] = await this.db
      .update(productClassificationsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productClassificationsTable.id, id))
      .returning();
    return row;
  }

  public async deleteClassification(id: string) {
    await this.db
      .delete(productClassificationsTable)
      .where(eq(productClassificationsTable.id, id));
  }

  public async deleteClassificationsByProduct(productId: string) {
    await this.db
      .delete(productClassificationsTable)
      .where(eq(productClassificationsTable.productId, productId));
  }

  // ── Classification Variants ─────────────────────────────────────────────────

  public async findVariantsByClassification(classificationId: string) {
    return this.db
      .select()
      .from(productClassificationVariantsTable)
      .where(eq(productClassificationVariantsTable.classificationId, classificationId));
  }

  public async findVariantsByClassifications(classificationIds: string[]) {
    if (classificationIds.length === 0) return [];
    return this.db
      .select()
      .from(productClassificationVariantsTable)
      .where(inArray(productClassificationVariantsTable.classificationId, classificationIds));
  }

  public async createVariant(data: {
    classificationId: string;
    name: string;
    minPrice?: string;
    maxPrice?: string;
    sortOrder?: number;
  }) {
    const [row] = await this.db
      .insert(productClassificationVariantsTable)
      .values({ id: randomUUID(), ...data })
      .returning();
    return row;
  }

  public async updateVariant(id: string, data: Partial<typeof productClassificationVariantsTable.$inferInsert>) {
    const [row] = await this.db
      .update(productClassificationVariantsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productClassificationVariantsTable.id, id))
      .returning();
    return row;
  }

  public async deleteVariant(id: string) {
    await this.db
      .delete(productClassificationVariantsTable)
      .where(eq(productClassificationVariantsTable.id, id));
  }

  // ── Aliases ─────────────────────────────────────────────────────────────────

  public async findAliasesByProduct(productId: string) {
    return this.db
      .select()
      .from(productAliasesTable)
      .where(eq(productAliasesTable.productId, productId));
  }

  public async createAlias(productId: string, alias: string, lang?: string) {
    const [row] = await this.db
      .insert(productAliasesTable)
      .values({ id: randomUUID(), productId, alias, lang })
      .returning();
    return row;
  }

  public async replaceAliases(productId: string, aliases: { alias: string; lang?: string }[]) {
    // Delete all then re-insert
    await this.db
      .delete(productAliasesTable)
      .where(eq(productAliasesTable.productId, productId));

    if (aliases.length === 0) return [];

    const rows = await this.db
      .insert(productAliasesTable)
      .values(aliases.map((a) => ({ id: randomUUID(), productId, ...a })))
      .returning();
    return rows;
  }

  // ── Mandi Assignments ───────────────────────────────────────────────────────

  public async findMandisByProduct(productId: string) {
    return this.db
      .select()
      .from(productMandiAssignmentsTable)
      .where(eq(productMandiAssignmentsTable.productId, productId));
  }

  public async setMandiAssignments(productId: string, mandiIds: string[]) {
    // Remove all existing assignments
    await this.db
      .delete(productMandiAssignmentsTable)
      .where(eq(productMandiAssignmentsTable.productId, productId));

    if (mandiIds.length === 0) return [];

    const rows = await this.db
      .insert(productMandiAssignmentsTable)
      .values(mandiIds.map((mandiId) => ({ id: randomUUID(), productId, mandiId })))
      .returning();
    return rows;
  }
}

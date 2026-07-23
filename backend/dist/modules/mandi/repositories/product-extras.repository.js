import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { productClassificationsTable, productClassificationVariantsTable, productAliasesTable, productMandiAssignmentsTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class ProductExtrasRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    // ── Classifications ─────────────────────────────────────────────────────────
    async findClassificationsByProduct(productId) {
        return this.db
            .select()
            .from(productClassificationsTable)
            .where(eq(productClassificationsTable.productId, productId));
    }
    async createClassification(data) {
        const [row] = await this.db
            .insert(productClassificationsTable)
            .values({ id: randomUUID(), ...data })
            .returning();
        return row;
    }
    async updateClassification(id, data) {
        const [row] = await this.db
            .update(productClassificationsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(productClassificationsTable.id, id))
            .returning();
        return row;
    }
    async deleteClassification(id) {
        await this.db
            .delete(productClassificationsTable)
            .where(eq(productClassificationsTable.id, id));
    }
    async deleteClassificationsByProduct(productId) {
        await this.db
            .delete(productClassificationsTable)
            .where(eq(productClassificationsTable.productId, productId));
    }
    // ── Classification Variants ─────────────────────────────────────────────────
    async findVariantsByClassification(classificationId) {
        return this.db
            .select()
            .from(productClassificationVariantsTable)
            .where(eq(productClassificationVariantsTable.classificationId, classificationId));
    }
    async findVariantsByClassifications(classificationIds) {
        if (classificationIds.length === 0)
            return [];
        return this.db
            .select()
            .from(productClassificationVariantsTable)
            .where(inArray(productClassificationVariantsTable.classificationId, classificationIds));
    }
    async createVariant(data) {
        const [row] = await this.db
            .insert(productClassificationVariantsTable)
            .values({ id: randomUUID(), ...data })
            .returning();
        return row;
    }
    async updateVariant(id, data) {
        const [row] = await this.db
            .update(productClassificationVariantsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(productClassificationVariantsTable.id, id))
            .returning();
        return row;
    }
    async deleteVariant(id) {
        await this.db
            .delete(productClassificationVariantsTable)
            .where(eq(productClassificationVariantsTable.id, id));
    }
    // ── Aliases ─────────────────────────────────────────────────────────────────
    async findAliasesByProduct(productId) {
        return this.db
            .select()
            .from(productAliasesTable)
            .where(eq(productAliasesTable.productId, productId));
    }
    async createAlias(productId, alias, lang) {
        const [row] = await this.db
            .insert(productAliasesTable)
            .values({ id: randomUUID(), productId, alias, lang })
            .returning();
        return row;
    }
    async replaceAliases(productId, aliases) {
        // Delete all then re-insert
        await this.db
            .delete(productAliasesTable)
            .where(eq(productAliasesTable.productId, productId));
        if (aliases.length === 0)
            return [];
        const rows = await this.db
            .insert(productAliasesTable)
            .values(aliases.map((a) => ({ id: randomUUID(), productId, ...a })))
            .returning();
        return rows;
    }
    // ── Mandi Assignments ───────────────────────────────────────────────────────
    async findMandisByProduct(productId) {
        return this.db
            .select()
            .from(productMandiAssignmentsTable)
            .where(eq(productMandiAssignmentsTable.productId, productId));
    }
    async setMandiAssignments(productId, mandiIds) {
        // Remove all existing assignments
        await this.db
            .delete(productMandiAssignmentsTable)
            .where(eq(productMandiAssignmentsTable.productId, productId));
        if (mandiIds.length === 0)
            return [];
        const rows = await this.db
            .insert(productMandiAssignmentsTable)
            .values(mandiIds.map((mandiId) => ({ id: randomUUID(), productId, mandiId })))
            .returning();
        return rows;
    }
}

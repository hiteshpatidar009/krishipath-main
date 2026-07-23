import { eq, and } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { mandiCropsTable, cropsTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class MandiCropRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findByMandi(mandiId) {
        return this.db
            .select({
            id: mandiCropsTable.id,
            mandiId: mandiCropsTable.mandiId,
            cropId: mandiCropsTable.cropId,
            cropCode: cropsTable.code,
            cropName: cropsTable.name,
            cropCategory: cropsTable.category,
            cropImageUrl: cropsTable.imageUrl,
            cropStatus: cropsTable.status,
            isEnabled: mandiCropsTable.isEnabled,
            priceInitStrategy: mandiCropsTable.priceInitStrategy,
            enabledAt: mandiCropsTable.enabledAt,
            disabledAt: mandiCropsTable.disabledAt,
        })
            .from(mandiCropsTable)
            .innerJoin(cropsTable, eq(mandiCropsTable.cropId, cropsTable.id))
            .where(eq(mandiCropsTable.mandiId, mandiId));
    }
    async findEnabledByMandi(mandiId) {
        return this.db
            .select({
            id: mandiCropsTable.id,
            cropId: mandiCropsTable.cropId,
            cropCode: cropsTable.code,
            cropName: cropsTable.name,
            cropCategory: cropsTable.category,
            cropImageUrl: cropsTable.imageUrl,
        })
            .from(mandiCropsTable)
            .innerJoin(cropsTable, eq(mandiCropsTable.cropId, cropsTable.id))
            .where(and(eq(mandiCropsTable.mandiId, mandiId), eq(mandiCropsTable.isEnabled, true), eq(cropsTable.status, "ACTIVE")));
    }
    async findOne(mandiId, cropId) {
        const result = await this.db
            .select()
            .from(mandiCropsTable)
            .where(and(eq(mandiCropsTable.mandiId, mandiId), eq(mandiCropsTable.cropId, cropId)))
            .limit(1);
        return result[0] || null;
    }
    async upsert(data) {
        const now = new Date();
        await this.db
            .insert(mandiCropsTable)
            .values({
            id: data.id,
            mandiId: data.mandiId,
            cropId: data.cropId,
            isEnabled: data.isEnabled,
            priceInitStrategy: data.priceInitStrategy ?? "EMPTY",
            sourcePriceMandiId: data.sourcePriceMandiId ?? null,
            enabledAt: now,
            createdAt: now,
            updatedAt: now,
        })
            .onConflictDoUpdate({
            target: [mandiCropsTable.mandiId, mandiCropsTable.cropId],
            set: {
                isEnabled: data.isEnabled,
                priceInitStrategy: data.priceInitStrategy ?? "EMPTY",
                sourcePriceMandiId: data.sourcePriceMandiId ?? null,
                disabledAt: data.isEnabled ? null : now,
                updatedAt: now,
            },
        });
    }
    async bulkInsert(records) {
        if (records.length === 0)
            return;
        const now = new Date();
        await this.db.insert(mandiCropsTable).values(records.map((r) => ({
            ...r,
            priceInitStrategy: r.priceInitStrategy ?? "EMPTY",
            enabledAt: now,
            createdAt: now,
            updatedAt: now,
        }))).onConflictDoNothing();
    }
    async getMandiIdsForCrop(cropId) {
        const result = await this.db
            .select({ mandiId: mandiCropsTable.mandiId })
            .from(mandiCropsTable)
            .where(and(eq(mandiCropsTable.cropId, cropId), eq(mandiCropsTable.isEnabled, true)));
        return result.map((r) => r.mandiId);
    }
}

import { and, asc, desc, eq, gt, gte, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { farmersTable, farmerWalletsTable, krishiPointsLedgerTable, rewardCatalogTable, rewardRedemptionsTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { AppError } from "../../../shared/errors/app.error";
export class RewardRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findFarmerId(userId, db = this.db) {
        const [farmer] = await db
            .select({ id: farmersTable.id })
            .from(farmersTable)
            .where(eq(farmersTable.userId, userId))
            .limit(1);
        return farmer?.id || null;
    }
    async getWalletBalance(farmerId) {
        const [wallet] = await this.db
            .select({ balance: farmerWalletsTable.balance })
            .from(farmerWalletsTable)
            .where(eq(farmerWalletsTable.farmerId, farmerId))
            .limit(1);
        return wallet?.balance ?? 0;
    }
    async getSummaryByUserId(userId) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return { balance: 0, lifetimeEarned: 0, redeemed: 0, history: [] };
        const [walletRows, history, redeemedRows] = await Promise.all([
            this.db.select().from(farmerWalletsTable).where(eq(farmerWalletsTable.farmerId, farmerId)).limit(1),
            this.db.select().from(krishiPointsLedgerTable)
                .where(eq(krishiPointsLedgerTable.farmerId, farmerId))
                .orderBy(desc(krishiPointsLedgerTable.createdAt))
                .limit(50),
            this.db.select({
                total: sql `coalesce(sum(case when ${krishiPointsLedgerTable.points} < 0 then -${krishiPointsLedgerTable.points} else 0 end), 0)`,
            }).from(krishiPointsLedgerTable).where(eq(krishiPointsLedgerTable.farmerId, farmerId)),
        ]);
        const wallet = walletRows[0];
        return {
            balance: wallet?.balance ?? 0,
            lifetimeEarned: wallet?.lifetimeEarned ?? 0,
            redeemed: Number(redeemedRows[0]?.total || 0),
            history,
        };
    }
    async getCatalogByUserId(userId) {
        const farmerId = await this.findFarmerId(userId);
        const balance = farmerId ? await this.getWalletBalance(farmerId) : 0;
        const items = await this.db
            .select()
            .from(rewardCatalogTable)
            .where(eq(rewardCatalogTable.isActive, true))
            .orderBy(asc(rewardCatalogTable.pointsCost), asc(rewardCatalogTable.title));
        return items.map((item) => ({
            ...item,
            inStock: item.stock == null || item.stock > 0,
            canRedeem: Boolean(farmerId) && balance >= item.pointsCost && (item.stock == null || item.stock > 0),
        }));
    }
    async createCatalogItem(data) {
        const [created] = await this.db.insert(rewardCatalogTable).values(data).returning();
        return created;
    }
    async updateCatalogItem(id, data) {
        const [updated] = await this.db
            .update(rewardCatalogTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(rewardCatalogTable.id, id))
            .returning();
        return updated || null;
    }
    async redeem(userId, catalogItemId) {
        return this.db.transaction(async (tx) => {
            const farmerId = await this.findFarmerId(userId, tx);
            if (!farmerId)
                throw new AppError("Farmer profile is required", 409, "FARMER_PROFILE_REQUIRED");
            const [item] = await tx
                .select()
                .from(rewardCatalogTable)
                .where(and(eq(rewardCatalogTable.id, catalogItemId), eq(rewardCatalogTable.isActive, true)))
                .limit(1);
            if (!item)
                throw new AppError("Reward is not available", 404, "REWARD_NOT_AVAILABLE");
            if (item.stock != null) {
                const [stockUpdated] = await tx
                    .update(rewardCatalogTable)
                    .set({ stock: sql `${rewardCatalogTable.stock} - 1`, updatedAt: new Date() })
                    .where(and(eq(rewardCatalogTable.id, item.id), gt(rewardCatalogTable.stock, 0)))
                    .returning({ id: rewardCatalogTable.id });
                if (!stockUpdated)
                    throw new AppError("Reward is out of stock", 409, "REWARD_OUT_OF_STOCK");
            }
            const [wallet] = await tx
                .update(farmerWalletsTable)
                .set({ balance: sql `${farmerWalletsTable.balance} - ${item.pointsCost}`, updatedAt: new Date() })
                .where(and(eq(farmerWalletsTable.farmerId, farmerId), gte(farmerWalletsTable.balance, item.pointsCost)))
                .returning();
            if (!wallet)
                throw new AppError("Not enough KrishiPoints", 409, "INSUFFICIENT_KRISHIPOINTS");
            const [redemption] = await tx.insert(rewardRedemptionsTable).values({
                farmerId,
                catalogItemId: item.id,
                pointsCost: item.pointsCost,
                status: "REQUESTED",
            }).returning();
            await tx.insert(krishiPointsLedgerTable).values({
                id: crypto.randomUUID(),
                farmerId,
                actionId: `REDEEM_${item.code}`,
                points: -item.pointsCost,
                description: `Redeemed: ${item.title}`,
            });
            return { redemption, item, balance: wallet.balance };
        });
    }
    async addPoints(farmerId, actionId, points, description) {
        await this.db.transaction(async (tx) => {
            await tx.insert(krishiPointsLedgerTable).values({
                id: crypto.randomUUID(), farmerId, actionId, points, description,
            });
            await tx.insert(farmerWalletsTable).values({
                farmerId,
                balance: points,
                lifetimeEarned: Math.max(points, 0),
            }).onConflictDoUpdate({
                target: farmerWalletsTable.farmerId,
                set: {
                    balance: sql `${farmerWalletsTable.balance} + ${points}`,
                    lifetimeEarned: sql `${farmerWalletsTable.lifetimeEarned} + ${Math.max(points, 0)}`,
                    updatedAt: new Date(),
                },
            });
        });
    }
}

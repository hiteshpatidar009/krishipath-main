import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { mandiTraderAssignmentsTable, tradersTable, usersTable, mandisTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class MandiTraderRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async listAllTraders() {
        return this.db
            .select({
            id: tradersTable.id,
            userId: tradersTable.userId,
            shopName: tradersTable.shopName,
            phone: usersTable.phone,
            licenseNumber: tradersTable.licenseNumber,
            primaryMandiId: tradersTable.primaryMandiId,
            primaryMandiName: mandisTable.name,
            cropSpecializations: tradersTable.cropSpecializations,
            verificationStatus: tradersTable.verificationStatus,
            isActive: tradersTable.isActive,
            createdAt: tradersTable.createdAt,
            updatedAt: tradersTable.updatedAt,
        })
            .from(tradersTable)
            .innerJoin(usersTable, eq(tradersTable.userId, usersTable.id))
            .leftJoin(mandisTable, eq(tradersTable.primaryMandiId, mandisTable.id))
            .orderBy(desc(tradersTable.updatedAt));
    }
    async findTraderById(id) {
        const [trader] = await this.db.select().from(tradersTable).where(eq(tradersTable.id, id)).limit(1);
        return trader || null;
    }
    async findTraderByUserId(userId) {
        const [trader] = await this.db.select().from(tradersTable).where(eq(tradersTable.userId, userId)).limit(1);
        return trader || null;
    }
    async findUserByPhone(phone) {
        const [user] = await this.db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
        return user || null;
    }
    async createTraderWithUser(data) {
        return this.db.transaction(async (tx) => {
            const userId = randomUUID();
            const now = new Date();
            await tx.insert(usersTable).values({
                id: userId,
                globalIdentityKey: `usr_${randomUUID()}`,
                phone: data.phone,
                status: "active",
                userType: "trader",
                profileStatus: "COMPLETE",
                isPhoneVerified: false,
                createdAt: now,
                updatedAt: now,
                version: 1,
            });
            return this.createTraderProfile(userId, data, tx);
        });
    }
    async createTraderProfile(userId, data, database = this.db) {
        const [created] = await database.insert(tradersTable).values({
            id: randomUUID(),
            userId,
            shopName: data.shopName,
            licenseNumber: data.licenseNumber || null,
            primaryMandiId: data.primaryMandiId,
            cropSpecializations: data.cropSpecializations || [],
            verificationStatus: data.verificationStatus,
            isActive: true,
        }).returning();
        return created;
    }
    async updateTrader(id, data) {
        const [updated] = await this.db
            .update(tradersTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(tradersTable.id, id))
            .returning();
        return updated || null;
    }
    async findByMandi(mandiId) {
        return this.db
            .select({
            id: mandiTraderAssignmentsTable.id,
            mandiId: mandiTraderAssignmentsTable.mandiId,
            traderId: mandiTraderAssignmentsTable.traderId,
            shopName: tradersTable.shopName,
            licenseNumber: tradersTable.licenseNumber,
            verificationStatus: tradersTable.verificationStatus,
            isActive: tradersTable.isActive,
            assignmentStatus: mandiTraderAssignmentsTable.status,
            assignedAt: mandiTraderAssignmentsTable.assignedAt,
            removedAt: mandiTraderAssignmentsTable.removedAt,
            notes: mandiTraderAssignmentsTable.notes,
        })
            .from(mandiTraderAssignmentsTable)
            .innerJoin(tradersTable, eq(mandiTraderAssignmentsTable.traderId, tradersTable.id))
            .where(eq(mandiTraderAssignmentsTable.mandiId, mandiId));
    }
    async findByTrader(traderId) {
        return this.db
            .select()
            .from(mandiTraderAssignmentsTable)
            .where(eq(mandiTraderAssignmentsTable.traderId, traderId));
    }
    async findOne(mandiId, traderId) {
        const result = await this.db
            .select()
            .from(mandiTraderAssignmentsTable)
            .where(and(eq(mandiTraderAssignmentsTable.mandiId, mandiId), eq(mandiTraderAssignmentsTable.traderId, traderId)))
            .limit(1);
        return result[0] || null;
    }
    async assign(data) {
        const now = new Date();
        await this.db
            .insert(mandiTraderAssignmentsTable)
            .values({
            id: data.id,
            mandiId: data.mandiId,
            traderId: data.traderId,
            status: "ACTIVE",
            assignedAt: now,
            assignedBy: data.assignedBy,
            notes: data.notes ?? null,
            createdAt: now,
            updatedAt: now,
        })
            .onConflictDoUpdate({
            target: [mandiTraderAssignmentsTable.mandiId, mandiTraderAssignmentsTable.traderId],
            set: {
                status: "ACTIVE",
                removedAt: null,
                assignedBy: data.assignedBy,
                notes: data.notes ?? null,
                updatedAt: now,
            },
        });
    }
    async updateStatus(mandiId, traderId, status, updatedBy) {
        await this.db
            .update(mandiTraderAssignmentsTable)
            .set({
            status,
            removedAt: status === "REMOVED" ? new Date() : null,
            updatedAt: new Date(),
        })
            .where(and(eq(mandiTraderAssignmentsTable.mandiId, mandiId), eq(mandiTraderAssignmentsTable.traderId, traderId)));
    }
}

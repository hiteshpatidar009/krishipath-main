import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import {
  mandiTraderAssignmentsTable,
  tradersTable,
  usersTable,
  mandisTable,
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class MandiTraderRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async listAllTraders() {
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

  public async findTraderById(id: string) {
    const [trader] = await this.db.select().from(tradersTable).where(eq(tradersTable.id, id)).limit(1);
    return trader || null;
  }

  public async findTraderByUserId(userId: string) {
    const [trader] = await this.db.select().from(tradersTable).where(eq(tradersTable.userId, userId)).limit(1);
    return trader || null;
  }

  public async findUserByPhone(phone: string) {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    return user || null;
  }

  public async createTraderWithUser(data: {
    phone: string;
    shopName: string;
    licenseNumber?: string | null;
    primaryMandiId: string;
    cropSpecializations?: unknown;
    verificationStatus: string;
  }) {
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

  public async createTraderProfile(
    userId: string,
    data: {
      shopName: string;
      licenseNumber?: string | null;
      primaryMandiId: string;
      cropSpecializations?: unknown;
      verificationStatus: string;
    },
    database: any = this.db,
  ) {
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

  public async updateTrader(id: string, data: Record<string, unknown>) {
    const [updated] = await this.db
      .update(tradersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tradersTable.id, id))
      .returning();
    return updated || null;
  }

  public async findByMandi(mandiId: string) {
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

  public async findByTrader(traderId: string) {
    return this.db
      .select()
      .from(mandiTraderAssignmentsTable)
      .where(eq(mandiTraderAssignmentsTable.traderId, traderId));
  }

  public async findOne(mandiId: string, traderId: string) {
    const result = await this.db
      .select()
      .from(mandiTraderAssignmentsTable)
      .where(
        and(
          eq(mandiTraderAssignmentsTable.mandiId, mandiId),
          eq(mandiTraderAssignmentsTable.traderId, traderId),
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  public async assign(data: {
    id: string;
    mandiId: string;
    traderId: string;
    assignedBy: string;
    notes?: string;
  }) {
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

  public async updateStatus(
    mandiId: string,
    traderId: string,
    status: string,
    updatedBy?: string,
  ) {
    await this.db
      .update(mandiTraderAssignmentsTable)
      .set({
        status,
        removedAt: status === "REMOVED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mandiTraderAssignmentsTable.mandiId, mandiId),
          eq(mandiTraderAssignmentsTable.traderId, traderId),
        ),
      );
  }
}

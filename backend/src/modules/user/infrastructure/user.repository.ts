import { randomUUID } from "crypto";
import { and, eq, inArray, isNull, sql, like, ilike, or, gt, asc, desc, type SQL } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database";
import {
  companiesTable,
  rolesTable,
  userProfilesTable,
  userRolesTable,
  usersTable,
  invitationsTable,
  userWarehouseAccessTable,
  roleWarehouseAccessTable,
  sessionsTable,
  teamsTable,
  teamMembersTable,
} from "../../../infrastructure/database/postgres/schemas/db1";
import { UserView } from "../domain/user.types";

export class UserRepository {
  public async create(input: {
    companyId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: string;
  }): Promise<{ userId: string }> {
    const userId = randomUUID();
    const now = new Date();
    const db = Db1Connection.getInstance();

    await db.insert(usersTable).values({
      id: userId,
      companyId: input.companyId,
      globalIdentityKey: `usr_${userId}`,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: [input.firstName, input.lastName].filter(Boolean).join(" ") || input.email,
      phone: input.phone,
      status: input.status || "invited",
      isEmailVerified: false,
      isPhoneVerified: false,
      isMfaEnabled: false,
      isSsoUser: false,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    const roles = await db
      .select({ id: rolesTable.id, isDefaultRole: rolesTable.isDefaultRole })
      .from(rolesTable)
      .where(and(eq(rolesTable.companyId, input.companyId), isNull(rolesTable.deletedAt)));
    
    const roleToAssign = roles.find(r => r.isDefaultRole)?.id || roles[0]?.id;
    if (roleToAssign) {
      await db.insert(userRolesTable).values({
        id: randomUUID(),
        userId: userId,
        roleId: roleToAssign,
        companyId: input.companyId,
        assignedAt: now,
      });
    }

    return { userId };
  }

  public async listPaginated(
    companyId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      role?: string;
      warehouse?: string;
      organization?: string;
      location?: string;
      userGroup?: string;
      status?: string;
      joinDateStart?: string;
      joinDateEnd?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{ users: any[]; total: number }> {
    const db = Db1Connection.getInstance();

    const conditions: SQL[] = [
      eq(userRolesTable.companyId, companyId),
      isNull(usersTable.deletedAt)
    ];

    if (params.status) {
      conditions.push(eq(usersTable.status, params.status));
    }

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      const searchCondition = or(
        ilike(usersTable.email, searchPattern),
        ilike(usersTable.firstName, searchPattern),
        ilike(usersTable.lastName, searchPattern),
        ilike(usersTable.displayName, searchPattern)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (params.joinDateStart) {
      conditions.push(sql`${usersTable.createdAt} >= ${new Date(params.joinDateStart)}`);
    }
    if (params.joinDateEnd) {
      conditions.push(sql`${usersTable.createdAt} <= ${new Date(params.joinDateEnd)}`);
    }

    if (params.role) {
      const roleCondition = or(
        eq(rolesTable.id, params.role),
        eq(rolesTable.name, params.role)
      );
      if (roleCondition) conditions.push(roleCondition);
    }

    if (params.organization) {
      conditions.push(eq(userRolesTable.branchId, params.organization));
    }

    if (params.userGroup) {
      const userGroupCondition = or(
        eq(teamsTable.id, params.userGroup),
        eq(teamsTable.teamCode, params.userGroup),
        eq(teamsTable.teamName, params.userGroup)
      );
      if (userGroupCondition) conditions.push(userGroupCondition);
    }

    let warehouseUserIds: string[] | null = null;
    if (params.warehouse) {
      const warehouseAccessList = await db
        .select({ userId: userWarehouseAccessTable.userId, allWarehouses: userWarehouseAccessTable.allWarehouses, warehouseIds: userWarehouseAccessTable.warehouseIds })
        .from(userWarehouseAccessTable)
        .where(eq(userWarehouseAccessTable.companyId, companyId));

      const matchedIds = new Set<string>();
      for (const wa of warehouseAccessList) {
        if (wa.allWarehouses) {
          matchedIds.add(wa.userId!);
        } else if (Array.isArray(wa.warehouseIds) && wa.warehouseIds.includes(params.warehouse)) {
          matchedIds.add(wa.userId!);
        }
      }
      
      const roleScopes = await db
        .select({ userId: userRolesTable.userId })
        .from(userRolesTable)
        .where(and(eq(userRolesTable.companyId, companyId), eq(userRolesTable.warehouseScopeId, params.warehouse)));
      for (const rs of roleScopes) {
        matchedIds.add(rs.userId!);
      }

      warehouseUserIds = Array.from(matchedIds);
      if (warehouseUserIds.length > 0) {
        conditions.push(inArray(usersTable.id, warehouseUserIds));
      } else {
        return { users: [], total: 0 };
      }
    }

    /*
    if (params.location) {
      const warehousesInLocation = await db2
        .select({ id: warehousesTable.id })
        .from(warehousesTable)
        .where(
          and(
            eq(warehousesTable.companyId, companyId),
            or(
              ilike(warehousesTable.city, `%${params.location}%`),
              ilike(warehousesTable.contactPhone, `%${params.location}%`)
            )
          )
        );
      
      const whIds = warehousesInLocation.map(w => w.id);
      if (whIds.length > 0) {
        const warehouseAccessList = await db
          .select({ userId: userWarehouseAccessTable.userId, allWarehouses: userWarehouseAccessTable.allWarehouses, warehouseIds: userWarehouseAccessTable.warehouseIds })
          .from(userWarehouseAccessTable)
          .where(eq(userWarehouseAccessTable.companyId, companyId));

        const matchedIds = new Set<string>();
        for (const wa of warehouseAccessList) {
          if (wa.allWarehouses) {
            matchedIds.add(wa.userId!);
          } else if (Array.isArray(wa.warehouseIds) && wa.warehouseIds.some(id => whIds.includes(id))) {
            matchedIds.add(wa.userId!);
          }
        }
        const locationUserIds = Array.from(matchedIds);
        if (locationUserIds.length > 0) {
          conditions.push(inArray(usersTable.id, locationUserIds));
        } else {
          return { users: [], total: 0 };
        }
      } else {
        return { users: [], total: 0 };
      }
    }
    */

    const queryBuilder = db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        displayName: usersTable.displayName,
        phone: usersTable.phone,
        status: usersTable.status,
        avatarUrl: usersTable.avatarUrl,
        lastLoginAt: usersTable.lastLoginAt,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        userType: usersTable.userType,
      })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .leftJoin(teamMembersTable, eq(usersTable.id, teamMembersTable.userId))
      .leftJoin(teamsTable, eq(teamMembersTable.teamId, teamsTable.id))
      .where(and(...conditions))
      .groupBy(usersTable.id);

    const sortableColumns = {
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      displayName: usersTable.displayName,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      lastLoginAt: usersTable.lastLoginAt,
    };
    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder || "desc";
    const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] ?? usersTable.createdAt;
    
    const countResult = await db
      .select({ count: sql<number>`count(distinct ${usersTable.id})` })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .leftJoin(teamMembersTable, eq(usersTable.id, teamMembersTable.userId))
      .leftJoin(teamsTable, eq(teamMembersTable.teamId, teamsTable.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count ?? 0);
    if (total === 0) {
      return { users: [], total: 0 };
    }

    const offset = (params.page - 1) * params.limit;
    const paginatedUsers = await queryBuilder
      .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(params.limit)
      .offset(offset);

    const userIds = paginatedUsers.map(u => u.id);
    
    const userRoles = await db
      .select({
        userId: userRolesTable.userId,
        roleName: rolesTable.name,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(and(eq(userRolesTable.companyId, companyId), inArray(userRolesTable.userId, userIds), isNull(rolesTable.deletedAt)));

    const warehouseAccess = await db
      .select()
      .from(userWarehouseAccessTable)
      .where(and(eq(userWarehouseAccessTable.companyId, companyId), inArray(userWarehouseAccessTable.userId, userIds)));

    // const allWarehouses = await db2
    //   .select({ id: warehousesTable.id, name: warehousesTable.warehouseName, city: warehousesTable.city })
    //   .from(warehousesTable)
    //   .where(and(eq(warehousesTable.companyId, companyId), isNull(warehousesTable.deletedAt)));
    // const warehouseMap = new Map(allWarehouses.map(w => [w.id, w]));
    const allWarehouses: any[] = [];
    const warehouseMap = new Map<string, any>();

    const usersList = paginatedUsers.map(user => {
      const uRoles = userRoles.filter(ur => ur.userId === user.id).map(ur => ur.roleName!);
      const uAccess = warehouseAccess.find(wa => wa.userId === user.id);
      
      let primaryWarehouse = "None";
      if (uAccess) {
        if (uAccess.allWarehouses) {
          const defaultWh = allWarehouses.find(w => (w.name ?? "").toLowerCase().includes("main")) || allWarehouses[0];
          primaryWarehouse = defaultWh ? `${defaultWh.name}, ${defaultWh.city || ""}` : "All Warehouses";
        } else if (Array.isArray(uAccess.warehouseIds) && uAccess.warehouseIds.length > 0) {
          const firstWh = warehouseMap.get(uAccess.warehouseIds[0]);
          primaryWarehouse = firstWh ? `${firstWh.name}, ${firstWh.city || ""}` : "Selected Warehouses";
        }
      }

      return {
        id: user.id,
        fullName: user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
        avatar: user.avatarUrl || null,
        roleNames: uRoles,
        primaryWarehouse,
        status: user.status,
        lastActive: user.lastLoginAt ? user.lastLoginAt.toISOString() : "Never",
        invitationStatus: user.status === "invited" ? "Pending" : "Accepted",
        userType: user.userType || "user",
      };
    });

    return { users: usersList, total };
  }

  public async list(companyId: string): Promise<UserView[]> {
    const res = await this.listPaginated(companyId, { page: 1, limit: 1000 });
    return res.users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: "",
      lastName: "",
      displayName: u.fullName,
      phone: null,
      status: u.status,
      companyId,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  public async find(companyId: string, userId: string): Promise<UserView | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        displayName: usersTable.displayName,
        phone: usersTable.phone,
        status: usersTable.status,
        avatarUrl: usersTable.avatarUrl,
        isMfaEnabled: usersTable.isMfaEnabled,
        lastLoginAt: usersTable.lastLoginAt,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(rolesTable.companyId, companyId),
          eq(usersTable.id, userId),
          isNull(usersTable.deletedAt),
          isNull(rolesTable.deletedAt),
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return {
      ...rows[0],
      companyId,
    };
  }

  public async update(companyId: string, userId: string, input: Record<string, unknown>): Promise<void> {
    const db = Db1Connection.getInstance();
    
    const belongs = await db
      .select({ id: userRolesTable.id })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(rolesTable.companyId, companyId),
          isNull(rolesTable.deletedAt),
        )
      )
      .limit(1);

    if (belongs.length === 0) {
      throw new Error("User does not belong to this company");
    }

    const { companyId: _, ...cleanInput } = input as any;
    await db
      .update(usersTable)
      .set({ ...cleanInput, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
  }

  public async updatePreferences(userId: string, input: Record<string, unknown>): Promise<void> {
    const rows = await Db1Connection.getInstance().select({ id: userProfilesTable.id }).from(userProfilesTable).where(eq(userProfilesTable.userId, userId)).limit(1);
    if (rows[0]) {
      await Db1Connection.getInstance().update(userProfilesTable).set({ ...input, updatedAt: new Date() }).where(eq(userProfilesTable.userId, userId));
      return;
    }
    await Db1Connection.getInstance().insert(userProfilesTable).values({ id: randomUUID(), userId, ...input, createdAt: new Date(), updatedAt: new Date() });
  }

  public async countTenantRoles(companyId: string, roleIds: string[]): Promise<number> {
    if (!roleIds.length) return 0;
    const rows = await Db1Connection.getInstance()
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(and(inArray(rolesTable.id, [...new Set(roleIds)]), eq(rolesTable.companyId, companyId), isNull(rolesTable.deletedAt)));
    return rows.length;
  }

  public async assignRoles(companyId: string, userId: string, roleIds: string[], assignedBy: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db.delete(userRolesTable).where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.companyId, companyId)));
    if (!roleIds.length) return;

    await db.insert(userRolesTable).values(
      roleIds.map((roleId) => ({
        id: randomUUID(),
        userId,
        roleId,
        companyId,
        assignedBy,
        assignedAt: new Date(),
      })),
    );
  }

  public async getSummary(companyId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingInvitations: number;
    lockedUsers: number;
  }> {
    const db = Db1Connection.getInstance();
    
    const totalUsersResult = await db
      .select({ count: sql<number>`count(distinct ${usersTable.id})` })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .where(and(eq(userRolesTable.companyId, companyId), isNull(usersTable.deletedAt)));

    const activeUsersResult = await db
      .select({ count: sql<number>`count(distinct ${usersTable.id})` })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .where(and(eq(userRolesTable.companyId, companyId), eq(usersTable.status, "active"), isNull(usersTable.deletedAt)));

    const inactiveUsersResult = await db
      .select({ count: sql<number>`count(distinct ${usersTable.id})` })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .where(and(eq(userRolesTable.companyId, companyId), eq(usersTable.status, "inactive"), isNull(usersTable.deletedAt)));

    const pendingResult = await db
      .select({ count: sql<number>`count(${invitationsTable.id})` })
      .from(invitationsTable)
      .where(and(eq(invitationsTable.companyId, companyId), eq(invitationsTable.status, "pending"), gt(invitationsTable.expiresAt, new Date())));

    const lockedUsersResult = await db
      .select({ count: sql<number>`count(distinct ${usersTable.id})` })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .where(
        and(
          eq(userRolesTable.companyId, companyId),
          or(
            eq(usersTable.status, "locked"),
            gt(usersTable.lockedUntil, new Date())
          ),
          isNull(usersTable.deletedAt)
        )
      );

    return {
      totalUsers: Number(totalUsersResult[0]?.count ?? 0),
      activeUsers: Number(activeUsersResult[0]?.count ?? 0),
      inactiveUsers: Number(inactiveUsersResult[0]?.count ?? 0),
      pendingInvitations: Number(pendingResult[0]?.count ?? 0),
      lockedUsers: Number(lockedUsersResult[0]?.count ?? 0),
    };
  }

  public async createInvitation(input: {
    companyId: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    warehouseAccess: any;
    message?: string;
    token: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<any> {
    const db = Db1Connection.getInstance();
    const id = randomUUID();
    const now = new Date();

    const rows = await db
      .insert(invitationsTable)
      .values({
        id,
        companyId: input.companyId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        roleId: input.roleId,
        warehouseAccess: input.warehouseAccess,
        message: input.message,
        token: input.token,
        invitedBy: input.invitedBy,
        status: "pending",
        expiresAt: input.expiresAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return rows[0];
  }

  public async getInvitations(companyId: string): Promise<any[]> {
    return Db1Connection.getInstance()
      .select()
      .from(invitationsTable)
      .where(eq(invitationsTable.companyId, companyId))
      .orderBy(desc(invitationsTable.createdAt));
  }

  public async findInvitationById(companyId: string, id: string): Promise<any | null> {
    const rows = await Db1Connection.getInstance()
      .select()
      .from(invitationsTable)
      .where(and(eq(invitationsTable.companyId, companyId), eq(invitationsTable.id, id)))
      .limit(1);
    return rows[0] ?? null;
  }

  public async findInvitationByToken(token: string): Promise<any | null> {
    const rows = await Db1Connection.getInstance()
      .select()
      .from(invitationsTable)
      .where(eq(invitationsTable.token, token))
      .limit(1);
    return rows[0] ?? null;
  }

  public async findUserByEmail(email: string): Promise<any | null> {
    const rows = await Db1Connection.getInstance()
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)))
      .limit(1);
    return rows[0] ?? null;
  }

  public async updateInvitation(id: string, updates: Record<string, any>): Promise<void> {
    await Db1Connection.getInstance()
      .update(invitationsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(invitationsTable.id, id));
  }

  public async getWarehouseAccess(companyId: string, userId: string): Promise<any | null> {
    const rows = await Db1Connection.getInstance()
      .select()
      .from(userWarehouseAccessTable)
      .where(and(eq(userWarehouseAccessTable.companyId, companyId), eq(userWarehouseAccessTable.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  public async updateWarehouseAccess(
    companyId: string,
    userId: string,
    access: { all: boolean; warehouseIds?: string[] }
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    const existing = await this.getWarehouseAccess(companyId, userId);
    
    const now = new Date();
    if (existing) {
      await db
        .update(userWarehouseAccessTable)
        .set({
          allWarehouses: access.all,
          warehouseIds: access.warehouseIds || [],
          updatedAt: now,
        })
        .where(eq(userWarehouseAccessTable.id, existing.id));
    } else {
      await db.insert(userWarehouseAccessTable).values({
        id: randomUUID(),
        companyId,
        userId,
        allWarehouses: access.all,
        warehouseIds: access.warehouseIds || [],
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  public async terminateSessions(userId: string): Promise<void> {
    await Db1Connection.getInstance()
      .update(sessionsTable)
      .set({
        revokedAt: new Date(),
        revokedReason: "Terminated by Admin",
      })
      .where(and(eq(sessionsTable.userId, userId), isNull(sessionsTable.revokedAt)));
  }

  public async checkInvitationExists(companyId: string, email: string): Promise<boolean> {
    const rows = await Db1Connection.getInstance()
      .select({ id: invitationsTable.id })
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.companyId, companyId),
          eq(invitationsTable.email, email),
          eq(invitationsTable.status, "pending"),
          gt(invitationsTable.expiresAt, new Date())
        )
      )
      .limit(1);
    return rows.length > 0;
  }
}

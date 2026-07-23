import { randomUUID } from "crypto";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { Db1Connection } from "../../../infrastructure/database";
import {
  permissionGroupsTable,
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable,
} from "../../../infrastructure/database/postgres/schemas/db1";

type DbRole = typeof rolesTable.$inferSelect;
type DbPermission = typeof permissionsTable.$inferSelect;

interface CreateRoleInput {
  companyId: string;
  createdBy: string;
  name: string;
  description?: string;
  color?: string;
  isSystemRole?: boolean;
  isDefaultRole?: boolean;
  canBeDeleted?: boolean;
  priority?: number;
  parentRoleId?: string;
  isRetired?: boolean;
}

interface UpdateRoleInput {
  name?: string;
  description?: string;
  color?: string;
  parentRoleId?: string | null;
  isRetired?: boolean;
}

export class RolePermissionRepository {
  public async ensurePermissionGroup(moduleName: string): Promise<string> {
    const db = Db1Connection.getInstance();
    const existing = await db
      .select()
      .from(permissionGroupsTable)
      .where(eq(permissionGroupsTable.moduleName, moduleName))
      .limit(1);

    if (existing[0]) {
      return existing[0].id;
    }

    const rows = await db
      .insert(permissionGroupsTable)
      .values({
        id: randomUUID(),
        moduleName,
        displayName: moduleName,
        description: moduleName,
        sortOrder: 100,
      })
      .returning();

    return rows[0].id;
  }

  public async createPermission(
    groupId: string,
    module: string,
    resource: string,
    action: string,
    key: string,
    description: string,
  ): Promise<string> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .insert(permissionsTable)
      .values({
        id: randomUUID(),
        permissionGroupId: groupId,
        module,
        resource,
        action,
        permissionKey: key,
        description,
        createdAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    if (rows[0]) {
      return rows[0].id;
    }

    const existing = await this.listPermissionsByKeys([key]);
    if (!existing[0]) {
      throw new Error("Permission create failed");
    }

    return existing[0].id;
  }

  public async listPermissions(): Promise<
    Array<
      DbPermission & {
        permissionGroupName: string | null;
        permissionGroupDisplayName: string | null;
      }
    >
  > {
    const db = Db1Connection.getInstance();

    return db
      .select({
        id: permissionsTable.id,
        permissionGroupId: permissionsTable.permissionGroupId,
        module: permissionsTable.module,
        resource: permissionsTable.resource,
        action: permissionsTable.action,
        permissionKey: permissionsTable.permissionKey,
        description: permissionsTable.description,
        createdAt: permissionsTable.createdAt,
        permissionGroupName: permissionGroupsTable.moduleName,
        permissionGroupDisplayName: permissionGroupsTable.displayName,
      })
      .from(permissionsTable)
      .leftJoin(
        permissionGroupsTable,
        eq(permissionGroupsTable.id, permissionsTable.permissionGroupId),
      )
      .orderBy(
        asc(permissionsTable.module),
        asc(permissionsTable.resource),
        asc(permissionsTable.action),
      );
  }

  public async listRoles(
    companyId: string,
  ): Promise<Array<DbRole & { permissionCount: number }>> {
    const db = Db1Connection.getInstance();

    return db
      .select({
        id: rolesTable.id,
        companyId: rolesTable.companyId,
        name: rolesTable.name,
        description: rolesTable.description,
        color: rolesTable.color,
        priority: rolesTable.priority,
        icon: rolesTable.icon,
        isSystemRole: rolesTable.isSystemRole,
        isDefaultRole: rolesTable.isDefaultRole,
        canBeDeleted: rolesTable.canBeDeleted,
        createdBy: rolesTable.createdBy,
        parentRoleId: rolesTable.parentRoleId,
        isRetired: rolesTable.isRetired,
        createdAt: rolesTable.createdAt,
        updatedAt: rolesTable.updatedAt,
        deletedAt: rolesTable.deletedAt,
        permissionCount: sql<number>`count(${rolePermissionsTable.permissionId})`,
      })
      .from(rolesTable)
      .leftJoin(rolePermissionsTable, eq(rolePermissionsTable.roleId, rolesTable.id))
      .where(and(eq(rolesTable.companyId, companyId), isNull(rolesTable.deletedAt)))
      .groupBy(rolesTable.id)
      .orderBy(asc(rolesTable.priority), asc(rolesTable.name));
  }

  public async listAllPermissions(): Promise<DbPermission[]> {
    const db = Db1Connection.getInstance();
    return db.select().from(permissionsTable);
  }

  public async findRoleById(companyId: string, roleId: string): Promise<DbRole | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(rolesTable)
      .where(
        and(
          eq(rolesTable.id, roleId),
          eq(rolesTable.companyId, companyId),
          isNull(rolesTable.deletedAt),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  public async findRoleByName(companyId: string, roleName: string): Promise<DbRole | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(rolesTable)
      .where(
        and(
          eq(rolesTable.companyId, companyId),
          eq(rolesTable.name, roleName),
          isNull(rolesTable.deletedAt),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  public async listRolePermissions(roleId: string): Promise<DbPermission[]> {
    const db = Db1Connection.getInstance();

    return db
      .select({
        id: permissionsTable.id,
        permissionGroupId: permissionsTable.permissionGroupId,
        module: permissionsTable.module,
        resource: permissionsTable.resource,
        action: permissionsTable.action,
        permissionKey: permissionsTable.permissionKey,
        description: permissionsTable.description,
        createdAt: permissionsTable.createdAt,
      })
      .from(rolePermissionsTable)
      .innerJoin(permissionsTable, eq(permissionsTable.id, rolePermissionsTable.permissionId))
      .where(eq(rolePermissionsTable.roleId, roleId))
      .orderBy(
        asc(permissionsTable.module),
        asc(permissionsTable.resource),
        asc(permissionsTable.action),
      );
  }

  public async listPermissionsByIds(ids: string[]): Promise<DbPermission[]> {
    if (!ids.length) {
      return [];
    }

    const db = Db1Connection.getInstance();
    return db.select().from(permissionsTable).where(inArray(permissionsTable.id, ids));
  }

  public async listPermissionsByKeys(keys: string[]): Promise<DbPermission[]> {
    if (!keys.length) {
      return [];
    }

    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(permissionsTable)
      .where(inArray(permissionsTable.permissionKey, keys));
  }

  public async listUserPermissionKeys(userId: string): Promise<readonly string[]> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select({
        permissionKey: permissionsTable.permissionKey,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(rolesTable.id, userRolesTable.roleId))
      .innerJoin(rolePermissionsTable, eq(rolePermissionsTable.roleId, rolesTable.id))
      .innerJoin(permissionsTable, eq(permissionsTable.id, rolePermissionsTable.permissionId))
      .where(and(eq(userRolesTable.userId, userId), isNull(rolesTable.deletedAt)));

    return rows
      .map((row) => row.permissionKey)
      .filter((key): key is string => Boolean(key));
  }

  public async hasPermission(userId: string, permissionKey: string): Promise<boolean> {
    const keys = await this.listUserPermissionKeys(userId);
    const moduleName = permissionKey.split(".")[0] ?? permissionKey.split(":")[0];
    return (
      keys.includes("*") ||
      keys.includes(permissionKey) ||
      keys.includes(`${moduleName}.*`) ||
      keys.includes(`${moduleName}:*`)
    );
  }

  public async createRole(
    input: CreateRoleInput,
    permissionIds: string[],
  ): Promise<DbRole> {
    const db = Db1Connection.getInstance();

    return db.transaction(async (tx) => {
      const now = new Date();
      const rows = await tx
        .insert(rolesTable)
        .values({
          id: randomUUID(),
          companyId: input.companyId,
          name: input.name,
          description: input.description ?? input.name,
          color: input.color,
          priority: input.priority ?? (input.isSystemRole ? 90 : 50),
          isSystemRole: input.isSystemRole ?? false,
          isDefaultRole: input.isDefaultRole ?? false,
          canBeDeleted: input.canBeDeleted ?? !(input.isSystemRole ?? false),
          createdBy: input.createdBy,
          parentRoleId: input.parentRoleId,
          isRetired: input.isRetired ?? false,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const role = rows[0];

      if (permissionIds.length) {
        await tx.insert(rolePermissionsTable).values(
          permissionIds.map((permissionId) => ({
            id: randomUUID(),
            roleId: role.id,
            permissionId,
            createdAt: now,
          })),
        );
      }

      return role;
    });
  }

  public async updateRole(
    roleId: string,
    updates: UpdateRoleInput,
    permissionIds?: string[],
  ): Promise<void> {
    const db = Db1Connection.getInstance();

    await db.transaction(async (tx) => {
      if (
        updates.name !== undefined ||
        updates.description !== undefined ||
        updates.color !== undefined ||
        updates.parentRoleId !== undefined ||
        updates.isRetired !== undefined
      ) {
        await tx
          .update(rolesTable)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(rolesTable.id, roleId));
      }

      if (permissionIds !== undefined) {
        await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));

        if (permissionIds.length) {
          const now = new Date();
          await tx.insert(rolePermissionsTable).values(
            permissionIds.map((permissionId) => ({
              id: randomUUID(),
              roleId,
              permissionId,
              createdAt: now,
            })),
          );
        }
      }
    });
  }

  public async softDeleteRole(roleId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(rolesTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rolesTable.id, roleId));
  }

  public async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    if (!permissionIds.length) {
      return;
    }

    const db = Db1Connection.getInstance();
    await db.insert(rolePermissionsTable).values(
      permissionIds.map((permissionId) => ({
        id: randomUUID(),
        roleId,
        permissionId,
        createdAt: new Date(),
      })),
    );
  }

  public async cloneRole(companyId: string, roleId: string, createdBy: string, name: string, description?: string, color?: string): Promise<DbRole> {
    const original = await this.findRoleById(companyId, roleId);
    if (!original) throw new Error("Role not found");

    const permissions = await this.listRolePermissions(roleId);
    return this.createRole({
      companyId,
      createdBy,
      name,
      description: description ?? `Clone of ${original.name}`,
      color: color ?? original.color ?? undefined,
      priority: original.priority ?? undefined,
      parentRoleId: original.parentRoleId ?? undefined,
    }, permissions.map(p => p.id));
  }

  public async checkInheritanceCycle(companyId: string, roleId: string, parentRoleId: string): Promise<boolean> {
    if (roleId === parentRoleId) return true;
    const db = Db1Connection.getInstance();
    
    let currentParentId: string | null = parentRoleId;
    const visited = new Set<string>([roleId]);
    
    while (currentParentId) {
      if (visited.has(currentParentId)) {
        return true;
      }
      visited.add(currentParentId);
      
      const parentRow = await db
        .select({ parentRoleId: rolesTable.parentRoleId })
        .from(rolesTable)
        .where(and(eq(rolesTable.id, currentParentId), eq(rolesTable.companyId, companyId), isNull(rolesTable.deletedAt)))
        .limit(1);
        
      currentParentId = parentRow[0]?.parentRoleId ?? null;
    }
    return false;
  }

  public async getResolvedRolePermissions(companyId: string, roleId: string): Promise<DbPermission[]> {
    const db = Db1Connection.getInstance();
    const resolvedMap = new Map<string, DbPermission>();
    
    let currentRoleIds = [roleId];
    const visited = new Set<string>();
    
    while (currentRoleIds.length > 0) {
      const nextRoleIds: string[] = [];
      
      for (const rid of currentRoleIds) {
        if (visited.has(rid)) continue;
        visited.add(rid);
        
        const directPermissions = await this.listRolePermissions(rid);
        for (const dp of directPermissions) {
          resolvedMap.set(dp.id, dp);
        }
        
        const roleRow = await db
          .select({ parentRoleId: rolesTable.parentRoleId })
          .from(rolesTable)
          .where(and(eq(rolesTable.id, rid), eq(rolesTable.companyId, companyId), isNull(rolesTable.deletedAt)))
          .limit(1);
          
        if (roleRow[0]?.parentRoleId) {
          nextRoleIds.push(roleRow[0].parentRoleId);
        }
      }
      
      currentRoleIds = nextRoleIds;
    }
    
    return Array.from(resolvedMap.values());
  }

  public async bulkUpdateMatrix(
    companyId: string,
    assignments: Array<{ roleId: string; permissionId: string; action: "grant" | "revoke" }>
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db.transaction(async (tx) => {
      for (const assignment of assignments) {
        const role = await tx
          .select({ id: rolesTable.id })
          .from(rolesTable)
          .where(and(eq(rolesTable.id, assignment.roleId), eq(rolesTable.companyId, companyId), isNull(rolesTable.deletedAt)))
          .limit(1);
        
        if (!role[0]) continue;

        if (assignment.action === "revoke") {
          await tx
            .delete(rolePermissionsTable)
            .where(
              and(
                eq(rolePermissionsTable.roleId, assignment.roleId),
                eq(rolePermissionsTable.permissionId, assignment.permissionId)
              )
            );
        } else {
          const existing = await tx
            .select({ id: rolePermissionsTable.id })
            .from(rolePermissionsTable)
            .where(
              and(
                eq(rolePermissionsTable.roleId, assignment.roleId),
                eq(rolePermissionsTable.permissionId, assignment.permissionId)
              )
            )
            .limit(1);

          if (!existing[0]) {
            await tx.insert(rolePermissionsTable).values({
              id: randomUUID(),
              roleId: assignment.roleId,
              permissionId: assignment.permissionId,
              createdAt: new Date(),
            });
          }
        }
      }
    });
  }
}

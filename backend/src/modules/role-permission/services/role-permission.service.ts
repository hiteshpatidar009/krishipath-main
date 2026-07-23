import { BaseService } from "../../../core/base/base.service";
import { logger } from "../../../infrastructure/logger";
import { AssignRolePermissionsDto } from "../dto/assign-role-permissions.dto";
import { CreateRoleDto } from "../dto/create-role.dto";
import { UpdateRoleDto } from "../dto/update-role.dto";
import { RolePermissionError } from "../errors/role-permission.error";
import { RolePermissionRepository } from "../repositories/role-permission.repository";
import { AuditLoggingService } from "../../../shared/audit/audit-logging.service";
import { randomUUID } from "crypto";

export class RolePermissionService extends BaseService {
  constructor(private readonly repository: RolePermissionRepository) {
    super("RolePermissionService");
  }

  public getStatus(): string {
    return "role-permission-module-ready";
  }

  public async listPermissions(): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.permissions.list", async () => {
      const permissions = await this.repository.listPermissions();
      return {
        permissions: permissions.map((permission) => ({
          id: permission.id,
          module: permission.module,
          resource: permission.resource,
          action: permission.action,
          permissionKey: permission.permissionKey,
          description: permission.description,
          permissionGroup: {
            id: permission.permissionGroupId,
            moduleName: permission.permissionGroupName,
            displayName: permission.permissionGroupDisplayName,
          },
        })),
      };
    });
  }

  public async listRoles(companyId: string): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.list", async () => {
      const roles = await this.repository.listRoles(companyId);
      return {
        roles: roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          color: role.color,
          priority: role.priority,
          isSystemRole: role.isSystemRole,
          isDefaultRole: role.isDefaultRole,
          canBeDeleted: role.canBeDeleted,
          parentRoleId: role.parentRoleId,
          isRetired: role.isRetired,
          permissionCount: Number(role.permissionCount ?? 0),
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        })),
      };
    });
  }

  public async getRoleDetail(
    companyId: string,
    roleId: string,
  ): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.detail", async () => {
      const role = await this.repository.findRoleById(companyId, roleId);
      if (!role) {
        throw new RolePermissionError(404, "Role not found");
      }

      const permissions = await this.repository.getResolvedRolePermissions(companyId, role.id);
      return {
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
          color: role.color,
          priority: role.priority,
          isSystemRole: role.isSystemRole,
          isDefaultRole: role.isDefaultRole,
          canBeDeleted: role.canBeDeleted,
          parentRoleId: role.parentRoleId,
          isRetired: role.isRetired,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
          permissions: permissions.map((permission) => ({
            id: permission.id,
            module: permission.module,
            resource: permission.resource,
            action: permission.action,
            permissionKey: permission.permissionKey,
            description: permission.description,
          })),
        },
      };
    });
  }

  public async createRole(
    companyId: string,
    userId: string,
    payload: CreateRoleDto,
  ): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.create", async () => {
      const duplicate = await this.repository.findRoleByName(companyId, payload.name);
      if (duplicate) {
        throw new RolePermissionError(409, "Role already exists");
      }

      const permissions = await this.resolvePermissions(
        payload.permissionIds,
        payload.permissionKeys,
        payload.assignAll,
      );

      await this.checkPrivilegeEscalationByIds(companyId, userId, permissions.map(p => p.id));

      if (payload.parentRoleId) {
        const parentRole = await this.repository.findRoleById(companyId, payload.parentRoleId);
        if (!parentRole) {
          throw new RolePermissionError(404, "Parent role not found");
        }
      }

      const role = await this.repository.createRole(
        {
          companyId,
          createdBy: userId,
          name: payload.name,
          description: payload.description,
          color: payload.color,
          parentRoleId: payload.parentRoleId,
        },
        permissions.map((permission) => permission.id),
      );

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.create",
        module: "role-permission",
        entityType: "role",
        entityId: role.id,
        status: "success",
        afterState: role as any,
      });

      return {
        roleId: role.id,
        name: role.name,
        permissionCount: permissions.length,
      };
    });
  }

  public async updateRole(
    companyId: string,
    roleId: string,
    userId: string,
    payload: UpdateRoleDto,
  ): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.update", async () => {
      const role = await this.repository.findRoleById(companyId, roleId);
      if (!role) {
        throw new RolePermissionError(404, "Role not found");
      }

      const trimmedName = payload.name?.trim();
      if (trimmedName && trimmedName !== role.name) {
        const duplicate = await this.repository.findRoleByName(companyId, trimmedName);
        if (duplicate && duplicate.id !== role.id) {
          throw new RolePermissionError(409, "Role already exists");
        }
      }

      const permissionIds = this.hasPermissionUpdate(payload)
        ? (
            await this.resolvePermissions(payload.permissionIds, payload.permissionKeys, payload.assignAll)
          ).map((permission) => permission.id)
        : undefined;

      if (permissionIds) {
        await this.checkPrivilegeEscalationByIds(companyId, userId, permissionIds);
      }

      if (payload.parentRoleId) {
        const cycle = await this.repository.checkInheritanceCycle(companyId, role.id, payload.parentRoleId);
        if (cycle) {
          throw new RolePermissionError(400, "Cyclic role inheritance detected");
        }
      }

      await this.repository.updateRole(
        role.id,
        {
          name: payload.name,
          description: payload.description,
          color: payload.color,
          parentRoleId: payload.parentRoleId,
        },
        permissionIds,
      );

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.update",
        module: "role-permission",
        entityType: "role",
        entityId: role.id,
        status: "success",
        beforeState: role as any,
        afterState: payload as any,
      });

      return {
        updated: true,
        roleId: role.id,
      };
    });
  }

  public async replaceRolePermissions(
    companyId: string,
    roleId: string,
    userId: string,
    payload: AssignRolePermissionsDto,
  ): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.permissions.replace", async () => {
      const role = await this.repository.findRoleById(companyId, roleId);
      if (!role) {
        throw new RolePermissionError(404, "Role not found");
      }

      const permissions = await this.resolvePermissions(
        payload.permissionIds,
        payload.permissionKeys,
        payload.assignAll,
      );

      const permissionIds = permissions.map((permission) => permission.id);
      await this.checkPrivilegeEscalationByIds(companyId, userId, permissionIds);

      await this.repository.updateRole(
        role.id,
        {},
        permissionIds,
      );

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.permissions.replace",
        module: "role-permission",
        entityType: "role",
        entityId: role.id,
        status: "success",
        afterState: { permissionIds },
      });

      return {
        roleId: role.id,
        permissionCount: permissions.length,
      };
    });
  }

  public async deleteRole(companyId: string, roleId: string, userId: string): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.delete", async () => {
      const role = await this.repository.findRoleById(companyId, roleId);
      if (!role) {
        throw new RolePermissionError(404, "Role not found");
      }

      if (role.isSystemRole || role.canBeDeleted === false) {
        throw new RolePermissionError(403, "Protected role cannot be deleted");
      }

      await this.repository.softDeleteRole(role.id);

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.delete",
        module: "role-permission",
        entityType: "role",
        entityId: role.id,
        status: "success",
        beforeState: role as any,
      });

      return {
        deleted: true,
        roleId: role.id,
      };
    });
  }

  public async cloneRole(
    companyId: string,
    roleId: string,
    userId: string,
    payload: { name: string; description?: string; color?: string }
  ): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.clone", async () => {
      const original = await this.repository.findRoleById(companyId, roleId);
      if (!original) throw new RolePermissionError(404, "Role not found");

      const duplicate = await this.repository.findRoleByName(companyId, payload.name);
      if (duplicate) throw new RolePermissionError(409, "Role name already in use");

      const originalPermissions = await this.repository.listRolePermissions(roleId);
      const originalPermissionIds = originalPermissions.map(p => p.id);

      await this.checkPrivilegeEscalationByIds(companyId, userId, originalPermissionIds);

      const clone = await this.repository.cloneRole(
        companyId,
        roleId,
        userId,
        payload.name,
        payload.description,
        payload.color
      );

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.clone",
        module: "role-permission",
        entityType: "role",
        entityId: clone.id,
        status: "success",
        afterState: clone as any,
      });

      return { cloned: true, roleId: clone.id };
    });
  }

  public async retireRole(companyId: string, roleId: string, userId: string): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.retire", async () => {
      const role = await this.repository.findRoleById(companyId, roleId);
      if (!role) throw new RolePermissionError(404, "Role not found");
      if (role.isSystemRole) throw new RolePermissionError(403, "System roles cannot be retired");

      await this.repository.updateRole(roleId, { isRetired: true });

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.retire",
        module: "role-permission",
        entityType: "role",
        entityId: role.id,
        status: "success",
      });

      return { retired: true, roleId: role.id };
    });
  }

  public async restoreRole(companyId: string, roleId: string, userId: string): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.roles.restore", async () => {
      const role = await this.repository.findRoleById(companyId, roleId);
      if (!role) throw new RolePermissionError(404, "Role not found");

      await this.repository.updateRole(roleId, { isRetired: false });

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "role.restore",
        module: "role-permission",
        entityType: "role",
        entityId: role.id,
        status: "success",
      });

      return { restored: true, roleId: role.id };
    });
  }

  public async getPermissionMatrix(companyId: string): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.matrix.get", async () => {
      const roles = await this.repository.listRoles(companyId);
      const permissions = await this.repository.listPermissions();

      const matrix: Record<string, Record<string, { granted: boolean; inherited: boolean; sourceRole: string | null }>> = {};

      for (const role of roles) {
        matrix[role.id] = {};
        const resolved = await this.repository.getResolvedRolePermissions(companyId, role.id);
        const resolvedIds = new Set(resolved.map(p => p.id));
        
        const direct = await this.repository.listRolePermissions(role.id);
        const directIds = new Set(direct.map(p => p.id));

        for (const perm of permissions) {
          const isResolved = resolvedIds.has(perm.id);
          const isDirect = directIds.has(perm.id);
          const isInherited = isResolved && !isDirect;

          matrix[role.id][perm.permissionKey!] = {
            granted: isResolved,
            inherited: isInherited,
            sourceRole: isInherited ? role.parentRoleId : null,
          };
        }
      }

      return {
        roles: roles.map(r => ({ id: r.id, name: r.name, isSystemRole: r.isSystemRole, parentRoleId: r.parentRoleId, isRetired: r.isRetired })),
        permissions: permissions.map(p => ({ id: p.id, key: p.permissionKey, group: p.permissionGroupName })),
        matrix,
      };
    });
  }

  public async savePermissionMatrix(
    companyId: string,
    userId: string,
    payload: { assignments: Array<{ roleId: string; permissionId: string; action: "grant" | "revoke" }> }
  ): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.matrix.save", async () => {
      const uniquePermissionIds = Array.from(new Set(payload.assignments.map(a => a.permissionId)));
      await this.checkPrivilegeEscalationByIds(companyId, userId, uniquePermissionIds);

      await this.repository.bulkUpdateMatrix(companyId, payload.assignments);

      await AuditLoggingService.record({
        companyId,
        userId,
        action: "permissions.matrix.update",
        module: "role-permission",
        entityType: "matrix",
        status: "success",
        metadata: { assignments: payload.assignments },
      });

      return { saved: true, affectedAssignments: payload.assignments.length };
    });
  }

  public async publishPermissionMatrix(companyId: string, userId: string): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.matrix.publish", async () => {
      await AuditLoggingService.record({
        companyId,
        userId,
        action: "permissions.matrix.publish",
        module: "role-permission",
        entityType: "matrix",
        status: "success",
      });

      return { published: true };
    });
  }

  public async compareRoles(companyId: string, roleIds: string[]): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.matrix.compare", async () => {
      const permissions = await this.repository.listPermissions();
      const rolesData: Array<{
        readonly roleId: string;
        readonly name: string | null;
        readonly permissionIds: string[];
      }> = [];

      for (const roleId of roleIds) {
        const role = await this.repository.findRoleById(companyId, roleId);
        if (!role) throw new RolePermissionError(404, `Role ${roleId} not found`);
        const resolved = await this.repository.getResolvedRolePermissions(companyId, role.id);
        rolesData.push({
          roleId: role.id,
          name: role.name,
          permissionIds: resolved.map(p => p.id),
        });
      }

      const comparison = permissions.map(perm => {
        const grants: Record<string, boolean> = {};
        for (const rd of rolesData) {
          grants[rd.roleId] = rd.permissionIds.includes(perm.id);
        }
        return {
          permissionId: perm.id,
          permissionKey: perm.permissionKey,
          description: perm.description,
          grants,
        };
      });

      return { roles: rolesData.map(r => ({ id: r.roleId, name: r.name })), comparison };
    });
  }

  public async listPermissionModules(): Promise<Record<string, unknown>> {
    return this.withLogs("role-permission.modules.list", async () => {
      const permissions = await this.repository.listPermissions();
      const modulesMap = new Map<string, { module: string; resources: Record<string, string[]> }>();

      for (const p of permissions) {
        if (!p.module || !p.resource || !p.action) continue;
        if (!modulesMap.has(p.module)) {
          modulesMap.set(p.module, { module: p.module, resources: {} });
        }
        const m = modulesMap.get(p.module)!;
        if (!m.resources[p.resource]) {
          m.resources[p.resource] = [];
        }
        if (!m.resources[p.resource].includes(p.action)) {
          m.resources[p.resource].push(p.action);
        }
      }

      return {
        modules: Array.from(modulesMap.values()).map(m => ({
          module: m.module,
          resources: Object.keys(m.resources).map(res => ({
            resource: res,
            actions: m.resources[res],
          })),
        })),
      };
    });
  }

  private async checkPrivilegeEscalationByIds(companyId: string, actorId: string, permissionIds: string[]): Promise<void> {
    if (!permissionIds.length) return;
    const actorKeys = await this.repository.listUserPermissionKeys(actorId);
    if (actorKeys.includes("*")) return;

    const permissions = await this.repository.listPermissionsByIds(permissionIds);
    const targetKeys = permissions.map(p => p.permissionKey).filter((k): k is string => Boolean(k));
    
    for (const key of targetKeys) {
      const moduleName = key.split(".")[0] ?? key.split(":")[0];
      const hasKey =
        actorKeys.includes(key) ||
        actorKeys.includes(`${moduleName}.*`) ||
        actorKeys.includes(`${moduleName}:*`);
        
      if (!hasKey) {
        throw new RolePermissionError(403, `Privilege escalation prevented: Actor does not possess permission '${key}'`);
      }
    }
  }

  private async resolvePermissions(
    permissionIds?: string[],
    permissionKeys?: string[],
    assignAll = false,
  ) {
    if (assignAll || permissionKeys?.includes("*")) {
      return this.repository.listAllPermissions();
    }

    const uniquePermissionIds = [...new Set(permissionIds ?? [])];
    const uniquePermissionKeys = [...new Set(permissionKeys ?? [])];
    const byId = await this.repository.listPermissionsByIds(uniquePermissionIds);
    const byKey = await this.repository.listPermissionsByKeys(uniquePermissionKeys);
    const resolved = new Map<string, (typeof byId)[number]>();

    for (const permission of [...byId, ...byKey]) {
      resolved.set(permission.id, permission);
    }

    if (uniquePermissionIds.length) {
      const foundIds = new Set(byId.map((permission) => permission.id));
      const missing = uniquePermissionIds.find((id) => !foundIds.has(id));
      if (missing) {
        throw new RolePermissionError(400, `Invalid permission id: ${missing}`);
      }
    }

    if (uniquePermissionKeys.length) {
      const foundKeys = new Set(byKey.map((permission) => permission.permissionKey ?? ""));
      const missing = uniquePermissionKeys.find((key) => !foundKeys.has(key));
      if (missing) {
        throw new RolePermissionError(400, `Invalid permission key: ${missing}`);
      }
    }

    return [...resolved.values()];
  }

  private hasPermissionUpdate(payload: UpdateRoleDto): boolean {
    return (
      payload.permissionIds !== undefined ||
      payload.permissionKeys !== undefined ||
      payload.assignAll !== undefined
    );
  }

  private async withLogs<T>(action: string, runner: () => Promise<T>): Promise<T> {
    await logger.info(`${action} started`, {
      module: "role-permission.service",
      tags: ["role-permission", "service", action, "start"],
    });

    try {
      const result = await runner();
      await logger.info(`${action} succeeded`, {
        module: "role-permission.service",
        tags: ["role-permission", "service", action, "ok"],
      });
      return result;
    } catch (error: unknown) {
      if (error instanceof RolePermissionError) {
        await logger.warn(`${action} failed`, {
          module: "role-permission.service",
          tags: ["role-permission", "service", action, "warn"],
          payload: {
            code: error.code,
            message: error.message,
          },
        });
        throw error;
      }

      const normalized = error instanceof Error ? error : new Error(action);
      await logger.error(normalized, {
        module: "role-permission.service",
        tags: ["role-permission", "service", action, "error"],
      });
      throw error;
    }
  }
}

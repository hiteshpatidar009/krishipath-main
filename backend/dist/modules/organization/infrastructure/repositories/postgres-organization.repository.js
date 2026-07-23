import { randomUUID } from "crypto";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { Db1Connection, Db2Connection } from "../../../../infrastructure/database";
import { organizationsTable, userRolesTable, } from "../../../../infrastructure/database/postgres/schemas/db1";
import { warehousesTable } from "../../../../infrastructure/database/postgres/schemas/db2";
export class PostgresOrganizationRepository {
    async create(input) {
        const organizationId = randomUUID();
        const now = new Date();
        await Db1Connection.getInstance().insert(organizationsTable).values({
            id: organizationId,
            companyId: input.companyId,
            name: input.name,
            legalName: input.legalName,
            organizationCode: input.organizationCode,
            email: input.email,
            phone: input.phone,
            status: "active",
            createdAt: now,
            updatedAt: now,
        });
        return { organizationId };
    }
    async update(input) {
        await Db1Connection.getInstance()
            .update(organizationsTable)
            .set({
            name: input.name,
            legalName: input.legalName,
            email: input.email,
            phone: input.phone,
            logoUrl: input.logoUrl,
            updatedAt: new Date(),
        })
            .where(and(eq(organizationsTable.id, input.organizationId), eq(organizationsTable.companyId, input.companyId), isNull(organizationsTable.deletedAt)));
    }
    async setStatus(companyId, organizationId, status) {
        await Db1Connection.getInstance()
            .update(organizationsTable)
            .set({ status, updatedAt: new Date() })
            .where(and(eq(organizationsTable.id, organizationId), eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt)));
    }
    async assignRole(input) {
        await Db1Connection.getInstance().insert(userRolesTable).values({
            id: randomUUID(),
            userId: input.userId,
            roleId: input.roleId,
            assignedBy: input.assignedBy,
            assignedAt: new Date(),
        });
    }
    async linkWarehouse(input) {
        await Db2Connection.getInstance()
            .update(warehousesTable)
            .set({ companyId: input.organizationId, updatedAt: new Date() })
            .where(and(eq(warehousesTable.id, input.warehouseId), eq(warehousesTable.companyId, input.companyId), isNull(warehousesTable.deletedAt)));
    }
    async findById(companyId, organizationId) {
        const rows = await Db1Connection.getInstance()
            .select({
            id: organizationsTable.id,
            companyId: organizationsTable.companyId,
            name: organizationsTable.name,
            status: organizationsTable.status,
        })
            .from(organizationsTable)
            .where(and(eq(organizationsTable.id, organizationId), eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt)))
            .limit(1);
        return rows[0] ?? null;
    }
    async findByNameOrCode(companyId, name, organizationCode) {
        const normalizedName = name.trim().toLowerCase();
        const normalizedCode = organizationCode.trim().toLowerCase();
        const rows = await Db1Connection.getInstance()
            .select({
            id: organizationsTable.id,
            companyId: organizationsTable.companyId,
            name: organizationsTable.name,
            status: organizationsTable.status,
        })
            .from(organizationsTable)
            .where(and(eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt), or(sql `lower(trim(${organizationsTable.name})) = ${normalizedName}`, sql `lower(trim(${organizationsTable.organizationCode})) = ${normalizedCode}`)))
            .limit(1);
        return rows[0] ?? null;
    }
    async listHierarchy(companyId) {
        return Db1Connection.getInstance()
            .select({
            id: organizationsTable.id,
            companyId: organizationsTable.companyId,
            name: organizationsTable.name,
            status: organizationsTable.status,
        })
            .from(organizationsTable)
            .where(and(eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt)));
    }
}

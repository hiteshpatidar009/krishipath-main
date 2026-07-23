import { randomUUID } from "crypto";
import { and, desc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { Db1Connection } from "../../../../infrastructure/database";
import { organizationsTable, permissionsTable, rolesTable, rolePermissionsTable, subscriptionsTable, companySettingsTable, companiesTable, userRolesTable, usersTable, } from "../../../../infrastructure/database/postgres/schemas/db1";
import { SubscriptionLimitService } from "../../../subscription";
export class PostgresCompanyRepository {
    async createTenant(input) {
        const db = Db1Connection.getInstance();
        const companyId = randomUUID();
        const now = new Date();
        const slug = input.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await db.transaction(async (tx) => {
            await tx.insert(companiesTable).values({
                id: companyId,
                userId: input.ownerUserId,
                code: `TEN-${Date.now().toString(36).toUpperCase()}`,
                name: input.companyName,
                slug: `${slug}-${Date.now().toString(36)}`,
                legalName: input.legalBusinessName ?? input.companyName,
                industry: input.industry,
                companySize: input.companySize,
                website: input.website,
                businessType: input.businessType,
                taxNumber: input.taxNumber,
                country: input.country,
                stateProvince: input.stateProvince,
                city: input.city,
                postalCode: input.postalCode,
                tenantType: "saas",
                status: "pending_subscription",
                onboardingStatus: "tenant_created",
                createdAt: now,
                updatedAt: now,
                version: 1,
            });
            await tx.insert(companySettingsTable).values({
                id: randomUUID(),
                companyId,
                timezone: input.timezone,
                defaultCurrencyCode: input.currencyCode.toUpperCase(),
                languageCode: "en",
                dateFormat: "YYYY-MM-DD",
                timeFormat: "HH:mm:ss",
                enableMfa: false,
                enableSso: false,
                enableApiAccess: true,
                enableCustomRoles: true,
                enableMultiCompany: true,
                enableMultiWarehouse: true,
                enableAuditExports: true,
                enableWebhooks: true,
                defaultSessionTimeoutMinutes: 120,
                maxFailedLoginAttempts: 5,
                createdAt: now,
                updatedAt: now,
            });
        });
        const allPermissions = await db
            .select({ id: permissionsTable.id })
            .from(permissionsTable);
        const permissionIds = [
            ...new Set(allPermissions.map((row) => row.id).filter(Boolean)),
        ];
        const roleId = randomUUID();
        await db.insert(rolesTable).values({
            id: roleId,
            companyId,
            name: "Super Admin",
            description: "Company owner with all permissions",
            isSystemRole: true,
            canBeDeleted: false,
            priority: 90,
            createdBy: input.ownerUserId,
            createdAt: now,
            updatedAt: now,
        });
        if (permissionIds.length) {
            await db.insert(rolePermissionsTable).values(permissionIds.map((permissionId) => ({
                id: randomUUID(),
                roleId,
                permissionId,
                createdAt: now,
            })));
        }
        await db.insert(userRolesTable).values({
            id: randomUUID(),
            userId: input.ownerUserId,
            roleId,
            startsAt: now,
            assignedBy: input.ownerUserId,
            assignedAt: now,
        });
        return {
            companyId,
            name: input.companyName,
            status: "pending_subscription",
        };
    }
    async getTenantCreationAllowance(userId) {
        const db = Db1Connection.getInstance();
        const owned = await db
            .select({
            id: companiesTable.id,
        })
            .from(companiesTable)
            .where(and(eq(companiesTable.userId, userId), isNull(companiesTable.deletedAt)));
        const uniqueOwned = [
            ...new Map(owned.map((row) => [row.id, row])).values(),
        ];
        const planInfo = await SubscriptionLimitService.getPlanLimits(userId);
        const maximumCount = Math.max(1, Number(planInfo.limits.maxCompanies ?? 1));
        const isPlanActive = planInfo.status === "active" ||
            planInfo.status === "trial" ||
            planInfo.status === "past_due";
        return {
            currentCount: uniqueOwned.length,
            maximumCount,
            canCreate: isPlanActive && uniqueOwned.length < maximumCount,
        };
    }
    async findOwnedTenantByName(ownerUserId, companyName) {
        const normalizedName = companyName.trim().toLowerCase();
        if (!normalizedName) {
            return null;
        }
        const [company] = await Db1Connection.getInstance()
            .select({
            companyId: companiesTable.id,
            name: companiesTable.name,
        })
            .from(companiesTable)
            .where(and(eq(companiesTable.userId, ownerUserId), isNull(companiesTable.deletedAt), sql `lower(trim(${companiesTable.name})) = ${normalizedName}`))
            .limit(1);
        return company ?? null;
    }
    async updateOnboardingStatus(companyId, status) {
        await Db1Connection.getInstance()
            .update(companiesTable)
            .set({ onboardingStatus: status, updatedAt: new Date() })
            .where(eq(companiesTable.id, companyId));
    }
    async createOrganization(input) {
        const db = Db1Connection.getInstance();
        const id = randomUUID();
        const now = new Date();
        await db.insert(organizationsTable).values({
            id,
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
        return { organizationId: id };
    }
    async findOrganizationByNameOrCode(companyId, name, organizationCode) {
        const normalizedName = name.trim().toLowerCase();
        const normalizedCode = organizationCode.trim().toLowerCase();
        const [organization] = await Db1Connection.getInstance()
            .select({
            id: organizationsTable.id,
            companyId: organizationsTable.companyId,
        })
            .from(organizationsTable)
            .where(and(eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt), or(sql `lower(trim(${organizationsTable.name})) = ${normalizedName}`, sql `lower(trim(${organizationsTable.organizationCode})) = ${normalizedCode}`)))
            .limit(1);
        return organization ?? null;
    }
    async configureTenantSettings(input) {
        await Db1Connection.getInstance()
            .update(companySettingsTable)
            .set({
            timezone: input.timezone,
            defaultCurrencyCode: input.defaultCurrencyCode,
            themeColor: input.themeColor,
            enableMfa: input.enableMfa,
            enableSso: input.enableSso,
            enableApiAccess: input.enableApiAccess,
            enableCustomRoles: input.enableCustomRoles,
            enableMultiCompany: input.enableMultiCompany,
            enableMultiWarehouse: input.enableMultiWarehouse,
            updatedAt: new Date(),
        })
            .where(eq(companySettingsTable.companyId, input.companyId));
    }
    async configureOrganizationSettings(input) {
        await Db1Connection.getInstance()
            .update(organizationsTable)
            .set({
            legalName: input.legalName,
            email: input.email,
            phone: input.phone,
            logoUrl: input.logoUrl,
            updatedAt: new Date(),
        })
            .where(and(eq(organizationsTable.id, input.organizationId), eq(organizationsTable.companyId, input.companyId), isNull(organizationsTable.deletedAt)));
    }
    async setTenantStatus(companyId, status) {
        await Db1Connection.getInstance()
            .update(companiesTable)
            .set({
            status,
            suspendedAt: status === "suspended" ? new Date() : null,
            activatedAt: status === "active" ? new Date() : undefined,
            updatedAt: new Date(),
        })
            .where(eq(companiesTable.id, companyId));
    }
    async linkSubscription(companyId, subscriptionPlanId) {
        await Db1Connection.getInstance()
            .update(companiesTable)
            .set({
            subscriptionPlanId,
            status: "active",
            activatedAt: new Date(),
            updatedAt: new Date(),
        })
            .where(eq(companiesTable.id, companyId));
    }
    async findCurrentSubscriptionPlanId(userId) {
        const db = Db1Connection.getInstance();
        const [billingSubscription] = await db
            .select({
            planId: subscriptionsTable.subscriptionPlanId,
            createdAt: subscriptionsTable.createdAt,
        })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.userId, userId))
            .orderBy(desc(subscriptionsTable.createdAt))
            .limit(1);
        return billingSubscription?.planId ?? null;
    }
    async assignScopedAccess(input) {
        await Db1Connection.getInstance().insert(userRolesTable).values({
            id: randomUUID(),
            userId: input.userId,
            roleId: input.roleId,
            companyId: input.companyId,
            branchId: input.branchId,
            warehouseScopeId: input.warehouseId,
            startsAt: new Date(),
            assignedBy: input.assignedBy,
            assignedAt: new Date(),
        });
    }
    async listAccessibleTenants(userId, isRoot) {
        const db = Db1Connection.getInstance();
        const rootRows = isRoot ?
            await db
                .select({
                companyId: companiesTable.id,
                name: companiesTable.name,
                code: companiesTable.code,
                industry: companiesTable.industry,
                city: companiesTable.city,
                stateProvince: companiesTable.stateProvince,
                country: companiesTable.country,
                status: companiesTable.status,
                onboardingStatus: companiesTable.onboardingStatus,
                joinedAt: usersTable.createdAt,
            })
                .from(usersTable)
                .innerJoin(companiesTable, eq(companiesTable.userId, usersTable.id))
                .where(and(eq(usersTable.id, userId), isNull(companiesTable.deletedAt)))
            : [];
        const iamRows = !isRoot
            ? await db
                .select({
                companyId: companiesTable.id,
                name: companiesTable.name,
                code: companiesTable.code,
                industry: companiesTable.industry,
                city: companiesTable.city,
                stateProvince: companiesTable.stateProvince,
                country: companiesTable.country,
                status: companiesTable.status,
                onboardingStatus: companiesTable.onboardingStatus,
                roleName: rolesTable.name,
                joinedAt: userRolesTable.assignedAt,
            })
                .from(userRolesTable)
                .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
                .innerJoin(companiesTable, eq(rolesTable.companyId, companiesTable.id))
                .where(and(eq(userRolesTable.userId, userId), isNull(rolesTable.deletedAt), isNull(companiesTable.deletedAt), 
            // IAM users only see companies they were INVITED to, not companies they own
            ne(companiesTable.userId, userId)))
            : [];
        const tenantMap = new Map();
        for (const row of rootRows) {
            tenantMap.set(row.companyId, {
                companyId: row.companyId,
                name: row.name,
                code: row.code,
                industry: row.industry,
                city: row.city,
                stateProvince: row.stateProvince,
                country: row.country,
                status: row.status,
                onboardingStatus: row.onboardingStatus,
                accessType: "root",
                roles: ["Root User"],
                joinedAt: row.joinedAt,
            });
        }
        for (const row of iamRows) {
            const existing = tenantMap.get(row.companyId);
            const roles = row.roleName ? [row.roleName] : [];
            if (!existing) {
                tenantMap.set(row.companyId, {
                    companyId: row.companyId,
                    name: row.name,
                    code: row.code,
                    industry: row.industry,
                    city: row.city,
                    stateProvince: row.stateProvince,
                    country: row.country,
                    status: row.status,
                    onboardingStatus: row.onboardingStatus,
                    accessType: "iam",
                    roles,
                    joinedAt: row.joinedAt,
                });
                continue;
            }
            tenantMap.set(row.companyId, {
                ...existing,
                roles: [...new Set([...existing.roles, ...roles])],
            });
        }
        return [...tenantMap.values()].sort((left, right) => String(left.name ?? "").localeCompare(String(right.name ?? "")));
    }
    async findTenantById(companyId) {
        const rows = await Db1Connection.getInstance()
            .select({ id: companiesTable.id, status: companiesTable.status })
            .from(companiesTable)
            .where(and(eq(companiesTable.id, companyId), isNull(companiesTable.deletedAt)))
            .limit(1);
        return rows[0] ?? null;
    }
    async findOrganizationById(companyId, organizationId) {
        const rows = await Db1Connection.getInstance()
            .select({
            id: organizationsTable.id,
            companyId: organizationsTable.companyId,
        })
            .from(organizationsTable)
            .where(and(eq(organizationsTable.id, organizationId), eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt)))
            .limit(1);
        return rows[0] ?? null;
    }
}

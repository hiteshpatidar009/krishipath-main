import { eq, and, or, isNull, sql } from "drizzle-orm";
import { Db1Connection, Db2Connection } from "../../../infrastructure/database";
import { AppError } from "../../../shared/errors/app.error";
import { subscriptionsTable, subscriptionPlansTable, usersTable, organizationsTable, companiesTable, apiKeysTable, webhookSubscriptionsTable, integrationConnectionsTable, rolesTable, userRolesTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { warehousesTable, productsTable, suppliersTable, customersTable, purchaseOrdersTable, salesOrdersTable, documentsTable, } from "../../../infrastructure/database/postgres/schemas/db2/all.schema";
import { randomUUID } from "crypto";
import { SubscriptionState } from "../../billing/constants/billing.constants";
import { BillingDateUtil } from "../../billing/utils/date.util";
import { billingSubscriptionsTable } from "../../billing/schemas/billing.schema";
export const PLAN_LIMITS = {
    free: {
        maxCompanies: 1,
        maxOrganizations: 1,
        maxWarehouses: 1,
        maxUsers: 10,
        maxProducts: 100,
        maxSuppliers: 10,
        maxCustomers: 50,
        maxPurchaseOrders: 10,
        maxSalesOrders: 50,
        maxApiKeys: 0,
        maxWebhooks: 0,
        maxIntegrations: 0,
        maxStorageGb: 1,
    },
    free_tier: {
        maxCompanies: 1,
        maxOrganizations: 1,
        maxWarehouses: 1,
        maxUsers: 10,
        maxProducts: 100,
        maxSuppliers: 10,
        maxCustomers: 50,
        maxPurchaseOrders: 10,
        maxSalesOrders: 50,
        maxApiKeys: 0,
        maxWebhooks: 0,
        maxIntegrations: 0,
        maxStorageGb: 1,
    },
    starter: {
        maxCompanies: 1,
        maxOrganizations: 3,
        maxWarehouses: 2,
        maxUsers: 25,
        maxProducts: 5000,
        maxSuppliers: 500,
        maxCustomers: 5000,
        maxPurchaseOrders: 500,
        maxSalesOrders: 2000,
        maxApiKeys: 1,
        maxWebhooks: 0,
        maxIntegrations: 2,
        maxStorageGb: 10,
    },
    growth: {
        maxCompanies: 3,
        maxOrganizations: 10,
        maxWarehouses: 5,
        maxUsers: 100,
        maxProducts: 50000,
        maxSuppliers: 5000,
        maxCustomers: 50000,
        maxPurchaseOrders: 5000,
        maxSalesOrders: 20000,
        maxApiKeys: 10,
        maxWebhooks: 20,
        maxIntegrations: 10,
        maxStorageGb: 100,
    },
    enterprise: {
        maxCompanies: 25,
        maxOrganizations: Infinity,
        maxWarehouses: 100,
        maxUsers: 500,
        maxProducts: Infinity,
        maxSuppliers: Infinity,
        maxCustomers: Infinity,
        maxPurchaseOrders: Infinity,
        maxSalesOrders: Infinity,
        maxApiKeys: Infinity,
        maxWebhooks: Infinity,
        maxIntegrations: Infinity,
        maxStorageGb: 1024,
    },
};
const TRIAL_LIMITS = {
    ...PLAN_LIMITS.free,
    maxCompanies: 1,
};
export class SubscriptionLimitService {
    static async checkAndActivateQueuedSubscriptions(userId) {
        const db = Db1Connection.getInstance();
        const now = new Date();
        const subs = await db
            .select({
            id: billingSubscriptionsTable.id,
            status: billingSubscriptionsTable.status,
            trialEndsAt: billingSubscriptionsTable.trialEndsAt,
            currentPeriodEnd: billingSubscriptionsTable.currentPeriodEnd,
            autoRenew: billingSubscriptionsTable.autoRenew,
            billingCycle: billingSubscriptionsTable.billingCycle,
            renewalMode: billingSubscriptionsTable.renewalMode,
        })
            .from(billingSubscriptionsTable)
            .where(and(eq(billingSubscriptionsTable.userId, userId), sql `${billingSubscriptionsTable.status} != 'CANCELLED'`, sql `${billingSubscriptionsTable.status} != 'EXPIRED'`))
            .orderBy(billingSubscriptionsTable.createdAt);
        let activeSub = subs.find(s => [
            SubscriptionState.Active,
            SubscriptionState.Trial,
            SubscriptionState.PastDue,
            SubscriptionState.Suspended,
        ].includes(s.status));
        if (activeSub) {
            let isExpired = false;
            if (activeSub.status === SubscriptionState.Trial && activeSub.trialEndsAt && activeSub.trialEndsAt < now) {
                isExpired = true;
            }
            else if (!activeSub.autoRenew && activeSub.currentPeriodEnd < now) {
                isExpired = true;
            }
            if (isExpired) {
                await db.update(billingSubscriptionsTable)
                    .set({ status: SubscriptionState.Expired, updatedAt: now })
                    .where(eq(billingSubscriptionsTable.id, activeSub.id));
                await db.update(subscriptionsTable)
                    .set({ status: SubscriptionState.Expired })
                    .where(eq(subscriptionsTable.id, activeSub.id));
                activeSub = undefined;
            }
        }
        if (!activeSub) {
            const nextQueued = subs.find(s => s.status === SubscriptionState.Queued);
            if (nextQueued) {
                const periodStart = new Date();
                const periodEnd = BillingDateUtil.addBillingCycle(periodStart, nextQueued.billingCycle);
                await db.update(billingSubscriptionsTable)
                    .set({
                    status: SubscriptionState.Active,
                    startDate: periodStart,
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                    updatedAt: now,
                })
                    .where(eq(billingSubscriptionsTable.id, nextQueued.id));
                await db.update(subscriptionsTable)
                    .set({
                    status: SubscriptionState.Active,
                    startDate: periodStart.toISOString().split("T")[0],
                    endDate: periodEnd.toISOString().split("T")[0],
                    renewalDate: periodEnd.toISOString().split("T")[0],
                })
                    .where(eq(subscriptionsTable.id, nextQueued.id));
            }
        }
    }
    static async getPlanLimits(companyId) {
        const db = Db1Connection.getInstance();
        // Find the owner of this company
        const currentTenantRows = await db
            .select({ ownerUserId: companiesTable.userId })
            .from(companiesTable)
            .where(eq(companiesTable.id, companyId))
            .limit(1);
        const ownerUserId = currentTenantRows[0]?.ownerUserId;
        const resolvedUserId = ownerUserId || companyId; // Fallback in case companyId is already a userId
        try {
            await this.checkAndActivateQueuedSubscriptions(resolvedUserId);
        }
        catch (err) {
            // Ignore transition errors to not block operations
        }
        const controlPlaneSubs = await db
            .select({
            status: subscriptionsTable.status,
            trialEndsAt: subscriptionsTable.trialEndsAt,
            planCode: subscriptionPlansTable.code,
            createdAt: subscriptionsTable.createdAt,
            maxCompanies: subscriptionPlansTable.maxCompanies,
            maxOrganizations: subscriptionPlansTable.maxOrganizations,
            maxWarehouses: subscriptionPlansTable.maxWarehouses,
            maxUsers: subscriptionPlansTable.maxUsers,
            maxProducts: subscriptionPlansTable.maxProducts,
            maxSuppliers: subscriptionPlansTable.maxSuppliers,
            maxCustomers: subscriptionPlansTable.maxCustomers,
            maxPurchaseOrders: subscriptionPlansTable.maxPurchaseOrders,
            maxSalesOrders: subscriptionPlansTable.maxSalesOrders,
            maxApiKeys: subscriptionPlansTable.maxApiKeys,
            maxWebhooks: subscriptionPlansTable.maxWebhooks,
            maxIntegrations: subscriptionPlansTable.maxIntegrations,
            maxStorageGb: subscriptionPlansTable.maxStorageGb,
        })
            .from(subscriptionsTable)
            .leftJoin(subscriptionPlansTable, eq(subscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
            .where(eq(subscriptionsTable.userId, resolvedUserId));
        const billingSubs = await db
            .select({
            status: billingSubscriptionsTable.status,
            trialEndsAt: billingSubscriptionsTable.trialEndsAt,
            planCode: subscriptionPlansTable.code,
            createdAt: billingSubscriptionsTable.createdAt,
            maxCompanies: subscriptionPlansTable.maxCompanies,
            maxOrganizations: subscriptionPlansTable.maxOrganizations,
            maxWarehouses: subscriptionPlansTable.maxWarehouses,
            maxUsers: subscriptionPlansTable.maxUsers,
            maxProducts: subscriptionPlansTable.maxProducts,
            maxSuppliers: subscriptionPlansTable.maxSuppliers,
            maxCustomers: subscriptionPlansTable.maxCustomers,
            maxPurchaseOrders: subscriptionPlansTable.maxPurchaseOrders,
            maxSalesOrders: subscriptionPlansTable.maxSalesOrders,
            maxApiKeys: subscriptionPlansTable.maxApiKeys,
            maxWebhooks: subscriptionPlansTable.maxWebhooks,
            maxIntegrations: subscriptionPlansTable.maxIntegrations,
            maxStorageGb: subscriptionPlansTable.maxStorageGb,
        })
            .from(billingSubscriptionsTable)
            .leftJoin(subscriptionPlansTable, eq(billingSubscriptionsTable.planId, subscriptionPlansTable.id))
            .where(eq(billingSubscriptionsTable.userId, resolvedUserId));
        const subs = [...billingSubs, ...controlPlaneSubs].sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime());
        if (subs.length === 0) {
            const [freePlan] = await db
                .select()
                .from(subscriptionPlansTable)
                .where(or(eq(subscriptionPlansTable.code, "free"), eq(subscriptionPlansTable.code, "free_tier")))
                .limit(1);
            const limits = freePlan ? {
                maxCompanies: freePlan.maxCompanies ?? 1,
                maxOrganizations: freePlan.maxOrganizations ?? 1,
                maxWarehouses: freePlan.maxWarehouses ?? 1,
                maxUsers: freePlan.maxUsers ?? 10,
                maxProducts: freePlan.maxProducts ?? 100,
                maxSuppliers: freePlan.maxSuppliers ?? 10,
                maxCustomers: freePlan.maxCustomers ?? 50,
                maxPurchaseOrders: freePlan.maxPurchaseOrders ?? 10,
                maxSalesOrders: freePlan.maxSalesOrders ?? 50,
                maxApiKeys: freePlan.maxApiKeys ?? 0,
                maxWebhooks: freePlan.maxWebhooks ?? 0,
                maxIntegrations: freePlan.maxIntegrations ?? 0,
                maxStorageGb: freePlan.maxStorageGb ?? 1,
            } : {
                maxCompanies: 1,
                maxOrganizations: 1,
                maxWarehouses: 1,
                maxUsers: 10,
                maxProducts: 100,
                maxSuppliers: 10,
                maxCustomers: 50,
                maxPurchaseOrders: 10,
                maxSalesOrders: 50,
                maxApiKeys: 0,
                maxWebhooks: 0,
                maxIntegrations: 0,
                maxStorageGb: 1,
            };
            return {
                status: "none",
                trialEndsAt: null,
                planCode: freePlan?.code || "free",
                limits,
            };
        }
        let sub = subs.find(s => [
            SubscriptionState.Active,
            SubscriptionState.Trial,
            SubscriptionState.PastDue,
            SubscriptionState.Suspended,
        ].includes((s.status ?? "").toUpperCase()));
        if (!sub) {
            sub = subs.find(s => (s.status ?? "").toUpperCase() === SubscriptionState.Queued);
        }
        if (!sub) {
            sub = subs[0];
        }
        let status = String(sub.status ?? "active").toLowerCase();
        if (status === "trial" && sub.trialEndsAt && sub.trialEndsAt < new Date()) {
            status = "expired";
        }
        const code = sub.planCode || "free_tier";
        const limits = {
            maxCompanies: sub.maxCompanies ?? 1,
            maxOrganizations: sub.maxOrganizations ?? 1,
            maxWarehouses: sub.maxWarehouses ?? 1,
            maxUsers: sub.maxUsers ?? 10,
            maxProducts: sub.maxProducts ?? 100,
            maxSuppliers: sub.maxSuppliers ?? 10,
            maxCustomers: sub.maxCustomers ?? 50,
            maxPurchaseOrders: sub.maxPurchaseOrders ?? 10,
            maxSalesOrders: sub.maxSalesOrders ?? 50,
            maxApiKeys: sub.maxApiKeys ?? 0,
            maxWebhooks: sub.maxWebhooks ?? 0,
            maxIntegrations: sub.maxIntegrations ?? 0,
            maxStorageGb: sub.maxStorageGb ?? 1,
        };
        return {
            status,
            trialEndsAt: sub.trialEndsAt,
            planCode: code,
            limits,
        };
    }
    static async verifySubscriptionActive(companyId) {
        const planInfo = await this.getPlanLimits(companyId);
        if (planInfo.status === "expired") {
            throw new AppError("Subscription expired", 403, "SUBSCRIPTION_RESTRICTED");
        }
        if (planInfo.status === "suspended") {
            throw new AppError("Subscription suspended", 403, "SUBSCRIPTION_RESTRICTED");
        }
        if (planInfo.status === "cancelled") {
            throw new AppError("Subscription cancelled", 403, "SUBSCRIPTION_RESTRICTED");
        }
    }
    // Count methods
    static async getUserCount(companyId) {
        const db = Db1Connection.getInstance();
        const rows = await db
            .select({ userId: usersTable.id })
            .from(usersTable)
            .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(and(eq(rolesTable.companyId, companyId), isNull(usersTable.deletedAt), isNull(rolesTable.deletedAt)));
        const uniqueUsers = new Set(rows.map(r => r.userId));
        return uniqueUsers.size;
    }
    static async getOrganizationCount(companyId) {
        const db = Db1Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(organizationsTable)
            .where(and(eq(organizationsTable.companyId, companyId), isNull(organizationsTable.deletedAt)));
        return Number(result[0]?.count ?? 0);
    }
    static async getWarehouseCount(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(warehousesTable)
            .where(and(eq(warehousesTable.companyId, companyId), isNull(warehousesTable.deletedAt)));
        return Number(result[0]?.count ?? 0);
    }
    static async getProductCount(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(productsTable)
            .where(and(eq(productsTable.companyId, companyId), isNull(productsTable.deletedAt)));
        return Number(result[0]?.count ?? 0);
    }
    static async getSupplierCount(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(suppliersTable)
            .where(eq(suppliersTable.companyId, companyId));
        return Number(result[0]?.count ?? 0);
    }
    static async getCustomerCount(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(customersTable)
            .where(eq(customersTable.companyId, companyId));
        return Number(result[0]?.count ?? 0);
    }
    static async getApiKeyCount(companyId) {
        const db = Db1Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(apiKeysTable)
            .where(and(eq(apiKeysTable.companyId, companyId), isNull(apiKeysTable.revokedAt)));
        return Number(result[0]?.count ?? 0);
    }
    static async getWebhookCount(companyId) {
        const db = Db1Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(webhookSubscriptionsTable)
            .where(eq(webhookSubscriptionsTable.companyId, companyId));
        return Number(result[0]?.count ?? 0);
    }
    static async getIntegrationCount(companyId) {
        const db = Db1Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(integrationConnectionsTable)
            .where(eq(integrationConnectionsTable.companyId, companyId));
        return Number(result[0]?.count ?? 0);
    }
    static async getPurchaseOrderCount(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(purchaseOrdersTable)
            .where(eq(purchaseOrdersTable.companyId, companyId));
        return Number(result[0]?.count ?? 0);
    }
    static async getSalesOrderCount(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ count: sql `count(*)` })
            .from(salesOrdersTable)
            .where(eq(salesOrdersTable.companyId, companyId));
        return Number(result[0]?.count ?? 0);
    }
    static async getStorageBytes(companyId) {
        const db = Db2Connection.getInstance();
        const result = await db
            .select({ totalSize: sql `sum(file_size)` })
            .from(documentsTable)
            .where(eq(documentsTable.companyId, companyId));
        return Number(result[0]?.totalSize ?? 0);
    }
    // Threshold checking
    static async checkThresholds(companyId, userId, resourceKey, currentCount, limit, resourcePlural, resourceSingular) {
        if (limit === Infinity || limit <= 0)
            return;
        let targetUserId = userId;
        if (!targetUserId) {
            const db = Db1Connection.getInstance();
            const [tenantOwner] = await db
                .select({ userId: companiesTable.userId })
                .from(companiesTable)
                .where(eq(companiesTable.id, companyId))
                .limit(1);
            targetUserId = tenantOwner?.userId || undefined;
        }
        if (!targetUserId)
            return;
        const p80 = Math.ceil(limit * 0.8);
        const p90 = Math.ceil(limit * 0.9);
        let message = null;
        let title = "Resource Warning";
        if (currentCount >= limit) {
            message = `You have reached your ${resourceSingular} limit.`;
            title = "Resource Limit Reached";
        }
        else if (currentCount === p90) {
            message = `You have used ${currentCount} of ${limit} ${resourcePlural}.`;
            title = "Resource Usage Warning (90%)";
        }
        else if (currentCount === p80) {
            message = `You have used ${currentCount} of ${limit} ${resourcePlural}.`;
            title = "Resource Usage Warning (80%)";
        }
        if (message) {
            const db = Db1Connection.getInstance();
            const exists = await db.execute(sql `
        SELECT id FROM notifications 
        WHERE company_id = ${companyId} AND user_id = ${targetUserId} AND message = ${message}
        LIMIT 1
      `);
            if (exists.rows.length === 0) {
                const id = randomUUID();
                await db.execute(sql `
          INSERT INTO notifications (
            id, company_id, user_id, type, channel, title,
            message, entity_type, priority, is_read, created_at
          ) VALUES (
            ${id}, ${companyId}, ${targetUserId}, 'limit_warning',
            'in_app', ${title}, ${message}, 'system', 'normal', false, NOW()
          )
        `);
            }
        }
    }
    // Assertion methods
    static async assertCanCreateUser(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getUserCount(companyId);
        if (count >= planInfo.limits.maxUsers) {
            throw new AppError("User limit reached", 403, "USER_LIMIT_REACHED");
        }
    }
    static async checkUserLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getUserCount(companyId);
        await this.checkThresholds(companyId, userId, "user", count, planInfo.limits.maxUsers, "user seats", "user");
    }
    static async assertCanCreateWarehouse(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getWarehouseCount(companyId);
        if (count >= planInfo.limits.maxWarehouses) {
            throw new AppError("Warehouse limit reached", 403, "WAREHOUSE_LIMIT_REACHED");
        }
    }
    static async checkWarehouseLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getWarehouseCount(companyId);
        await this.checkThresholds(companyId, userId, "warehouse", count, planInfo.limits.maxWarehouses, "warehouses", "warehouse");
    }
    static async assertCanCreateProduct(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getProductCount(companyId);
        if (count >= planInfo.limits.maxProducts) {
            throw new AppError("Product limit reached", 403, "PRODUCT_LIMIT_REACHED");
        }
    }
    static async checkProductLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getProductCount(companyId);
        await this.checkThresholds(companyId, userId, "product", count, planInfo.limits.maxProducts, "products", "product");
    }
    static async assertCanCreateSupplier(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getSupplierCount(companyId);
        if (count >= planInfo.limits.maxSuppliers) {
            throw new AppError("Supplier limit reached", 403, "SUPPLIER_LIMIT_REACHED");
        }
    }
    static async checkSupplierLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getSupplierCount(companyId);
        await this.checkThresholds(companyId, userId, "supplier", count, planInfo.limits.maxSuppliers, "suppliers", "supplier");
    }
    static async assertCanCreateCustomer(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getCustomerCount(companyId);
        if (count >= planInfo.limits.maxCustomers) {
            throw new AppError("Customer limit reached", 403, "CUSTOMER_LIMIT_REACHED");
        }
    }
    static async checkCustomerLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getCustomerCount(companyId);
        await this.checkThresholds(companyId, userId, "customer", count, planInfo.limits.maxCustomers, "customers", "customer");
    }
    static async assertCanCreateApiKey(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getApiKeyCount(companyId);
        if (count >= planInfo.limits.maxApiKeys) {
            throw new AppError("API Key limit reached", 403, "API_KEY_LIMIT_REACHED");
        }
    }
    static async checkApiKeyLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getApiKeyCount(companyId);
        await this.checkThresholds(companyId, userId, "api_key", count, planInfo.limits.maxApiKeys, "API keys", "API key");
    }
    static async assertCanCreateWebhook(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getWebhookCount(companyId);
        if (count >= planInfo.limits.maxWebhooks) {
            throw new AppError("Webhook limit reached", 403, "WEBHOOK_LIMIT_REACHED");
        }
    }
    static async checkWebhookLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getWebhookCount(companyId);
        await this.checkThresholds(companyId, userId, "webhook", count, planInfo.limits.maxWebhooks, "webhooks", "webhook");
    }
    static async assertCanCreateIntegration(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getIntegrationCount(companyId);
        if (count >= planInfo.limits.maxIntegrations) {
            throw new AppError("Integration limit reached", 403, "INTEGRATION_LIMIT_REACHED");
        }
    }
    static async checkIntegrationLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getIntegrationCount(companyId);
        await this.checkThresholds(companyId, userId, "integration", count, planInfo.limits.maxIntegrations, "integrations", "integration");
    }
    static async assertCanCreateOrganization(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getOrganizationCount(companyId);
        if (count >= planInfo.limits.maxOrganizations) {
            throw new AppError("Organization limit reached", 403, "ORGANIZATION_LIMIT_REACHED");
        }
    }
    static async checkOrganizationLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getOrganizationCount(companyId);
        await this.checkThresholds(companyId, userId, "organization", count, planInfo.limits.maxOrganizations, "organizations", "organization");
    }
    static async assertCanCreatePurchaseOrder(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getPurchaseOrderCount(companyId);
        if (count >= planInfo.limits.maxPurchaseOrders) {
            throw new AppError("Purchase order limit reached", 403, "PURCHASE_ORDER_LIMIT_REACHED");
        }
    }
    static async checkPurchaseOrderLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getPurchaseOrderCount(companyId);
        await this.checkThresholds(companyId, userId, "purchase_order", count, planInfo.limits.maxPurchaseOrders, "purchase orders", "purchase order");
    }
    static async assertCanCreateSalesOrder(companyId) {
        await this.verifySubscriptionActive(companyId);
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getSalesOrderCount(companyId);
        if (count >= planInfo.limits.maxSalesOrders) {
            throw new AppError("Sales order limit reached", 403, "SALES_ORDER_LIMIT_REACHED");
        }
    }
    static async checkSalesOrderLimit(companyId, userId) {
        const planInfo = await this.getPlanLimits(companyId);
        const count = await this.getSalesOrderCount(companyId);
        await this.checkThresholds(companyId, userId, "sales_order", count, planInfo.limits.maxSalesOrders, "sales orders", "sales order");
    }
    static async assertCanCreateCompany(userId) {
        const planInfo = await this.getPlanLimits(userId);
        if (planInfo.status !== "active" && planInfo.status !== "trial" && planInfo.status !== "past_due") {
            throw new AppError("Active subscription required to create a company", 403, "SUBSCRIPTION_REQUIRED");
        }
        const db = Db1Connection.getInstance();
        const owned = await db
            .select({
            id: companiesTable.id,
        })
            .from(companiesTable)
            .where(and(eq(companiesTable.userId, userId), isNull(companiesTable.deletedAt)));
        const uniqueOwned = [...new Map(owned.map((row) => [row.id, row])).values()];
        const maximumCount = Math.max(1, Number(planInfo.limits.maxCompanies ?? 1));
        if (uniqueOwned.length >= maximumCount) {
            throw new AppError("Company limit reached", 403, "COMPANY_LIMIT_REACHED");
        }
    }
    static async assertCanUpdate(companyId) {
        await this.verifySubscriptionActive(companyId);
    }
}

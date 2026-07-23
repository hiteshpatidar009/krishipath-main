import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database";
import { subscriptionPlansTable, subscriptionsTable, subscriptionUsageTable } from "../../../infrastructure/database/postgres/schemas/db1";
export class SubscriptionRepository {
    async ensureDefaultPlans(plans) {
        const db = Db1Connection.getInstance();
        for (const plan of plans) {
            const [existing] = await db
                .select({ id: subscriptionPlansTable.id })
                .from(subscriptionPlansTable)
                .where(eq(subscriptionPlansTable.code, plan.code))
                .limit(1);
            const values = {
                name: plan.name,
                code: plan.code,
                description: plan.description,
                monthlyPrice: plan.monthlyPrice,
                annualPrice: plan.annualPrice,
                currencyCode: plan.currencyCode,
                monthlyDurationMonths: plan.monthlyDurationMonths,
                annualDurationMonths: plan.annualDurationMonths,
                maxUsers: plan.maxUsers,
                maxWarehouses: plan.maxWarehouses,
                maxCompanies: plan.maxCompanies,
                maxOrganizations: plan.maxOrganizations,
                maxProducts: plan.maxProducts,
                maxSuppliers: plan.maxSuppliers,
                maxCustomers: plan.maxCustomers,
                maxPurchaseOrders: plan.maxPurchaseOrders,
                maxSalesOrders: plan.maxSalesOrders,
                maxApiKeys: plan.maxApiKeys,
                maxWebhooks: plan.maxWebhooks,
                maxIntegrations: plan.maxIntegrations,
                maxApiRequestsPerMonth: plan.maxApiRequestsPerMonth,
                maxStorageGb: plan.maxStorageGb,
                supportsApi: plan.supportsApi,
                supportsSso: plan.supportsSso,
                supportsCustomRoles: plan.supportsCustomRoles,
                supportsMultiEntity: plan.supportsMultiEntity,
                supportsAdvancedReporting: plan.supportsAdvancedReporting,
                supportsSandbox: plan.supportsSandbox,
                enterpriseEnabled: plan.enterpriseEnabled,
                updatedAt: new Date(),
            };
            if (existing) {
                await db.update(subscriptionPlansTable).set(values).where(eq(subscriptionPlansTable.id, existing.id));
            }
            else {
                await db.insert(subscriptionPlansTable).values({
                    id: randomUUID(),
                    ...values,
                    createdAt: new Date(),
                });
            }
        }
    }
    listPlans() {
        return Db1Connection.getInstance().select({
            id: subscriptionPlansTable.id,
            name: subscriptionPlansTable.name,
            code: subscriptionPlansTable.code,
            description: subscriptionPlansTable.description,
            monthlyPrice: subscriptionPlansTable.monthlyPrice,
            annualPrice: subscriptionPlansTable.annualPrice,
            currencyCode: subscriptionPlansTable.currencyCode,
            monthlyDurationMonths: subscriptionPlansTable.monthlyDurationMonths,
            annualDurationMonths: subscriptionPlansTable.annualDurationMonths,
            maxUsers: subscriptionPlansTable.maxUsers,
            maxWarehouses: subscriptionPlansTable.maxWarehouses,
            maxCompanies: subscriptionPlansTable.maxCompanies,
            maxOrganizations: subscriptionPlansTable.maxOrganizations,
            maxProducts: subscriptionPlansTable.maxProducts,
            maxSuppliers: subscriptionPlansTable.maxSuppliers,
            maxCustomers: subscriptionPlansTable.maxCustomers,
            maxPurchaseOrders: subscriptionPlansTable.maxPurchaseOrders,
            maxSalesOrders: subscriptionPlansTable.maxSalesOrders,
            maxApiKeys: subscriptionPlansTable.maxApiKeys,
            maxWebhooks: subscriptionPlansTable.maxWebhooks,
            maxIntegrations: subscriptionPlansTable.maxIntegrations,
            maxApiRequestsPerMonth: subscriptionPlansTable.maxApiRequestsPerMonth,
            maxStorageGb: subscriptionPlansTable.maxStorageGb,
            supportsApi: subscriptionPlansTable.supportsApi,
            supportsSso: subscriptionPlansTable.supportsSso,
            supportsCustomRoles: subscriptionPlansTable.supportsCustomRoles,
            supportsMultiEntity: subscriptionPlansTable.supportsMultiEntity,
            supportsAdvancedReporting: subscriptionPlansTable.supportsAdvancedReporting,
            supportsSandbox: subscriptionPlansTable.supportsSandbox,
            enterpriseEnabled: subscriptionPlansTable.enterpriseEnabled,
            createdAt: subscriptionPlansTable.createdAt,
            updatedAt: subscriptionPlansTable.updatedAt,
        }).from(subscriptionPlansTable);
    }
    async createPlan(input) {
        const now = new Date();
        const [record] = await Db1Connection.getInstance().insert(subscriptionPlansTable).values({
            id: randomUUID(),
            ...input,
            createdAt: now,
            updatedAt: now,
        }).returning();
        return record;
    }
    async updatePlan(id, input) {
        const [record] = await Db1Connection.getInstance()
            .update(subscriptionPlansTable)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(subscriptionPlansTable.id, id))
            .returning();
        return record ?? null;
    }
    async create(input) {
        const subscriptionId = randomUUID();
        const today = new Date().toISOString().slice(0, 10);
        await Db1Connection.getInstance().insert(subscriptionsTable).values({
            id: subscriptionId,
            userId: input.companyId,
            subscriptionPlanId: input.subscriptionPlanId,
            subscriptionNumber: `SUB-${Date.now()}`,
            billingCycle: input.billingCycle,
            startDate: today,
            trialEndsAt: input.trialEndsAt,
            autoRenew: true,
            status: input.trialEndsAt ? "trial" : "active",
            createdAt: new Date(),
        });
        return { subscriptionId };
    }
    async current(companyId) {
        const rows = await Db1Connection.getInstance().select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, companyId)).limit(1);
        return rows[0] ?? null;
    }
    async status(companyId, status, reason) {
        await Db1Connection.getInstance().update(subscriptionsTable).set({ status, cancelledAt: status === "cancelled" ? new Date() : undefined, cancellationReason: reason }).where(eq(subscriptionsTable.userId, companyId));
    }
    async usage(input) {
        const today = new Date().toISOString().slice(0, 10);
        await Db1Connection.getInstance().insert(subscriptionUsageTable).values({
            id: randomUUID(),
            companyId: input.companyId,
            subscriptionId: input.subscriptionId,
            metricName: input.metricName,
            metricValue: String(input.metricValue),
            usagePeriodStart: today,
            usagePeriodEnd: today,
            updatedAt: new Date(),
        });
    }
}

import { randomUUID } from "crypto";
import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { subscriptionPlansTable, subscriptionsTable } from "../../../infrastructure/database/postgres/schemas/db1";
import { BILLING_DEFAULTS, BillingCycle, CreditStatus, RenewalMode, RetryStatus, SubscriptionState } from "../constants/billing.constants";
import { billingCreditsTable, billingIdempotencyKeysTable, billingInvoicesTable, billingPaymentProfilesTable, billingPaymentRetriesTable, billingPaymentsTable, billingRefundsTable, billingSubscriptionChangesTable, billingSubscriptionEventsTable, billingSubscriptionsTable, billingUsageTrackingTable, } from "../schemas/billing.schema";
import { BillingDateUtil } from "../utils/date.util";
import { IdempotencyUtil } from "../utils/idempotency.util";
export class BillingRepository {
    db = Db1Connection.getInstance();
    async transaction(callback) {
        return this.db.transaction(async (tx) => callback(new BillingRepository(tx)));
    }
    constructor(db) {
        if (db) {
            this.db = db;
        }
    }
    async createSubscription(record) {
        const now = new Date();
        const id = randomUUID();
        const [created] = await this.db.insert(billingSubscriptionsTable).values({
            ...record,
            id,
            createdAt: now,
            updatedAt: now,
        }).returning();
        await this.db.insert(subscriptionsTable).values({
            id,
            userId: record.userId,
            subscriptionPlanId: record.planId,
            subscriptionNumber: `SUB-${Date.now()}`,
            billingCycle: this.toControlPlaneBillingCycle(record.billingCycle),
            startDate: record.startDate ? this.toDateString(record.startDate) : null,
            endDate: record.currentPeriodEnd ? this.toDateString(record.currentPeriodEnd) : null,
            renewalDate: record.nextBillingAt ? this.toDateString(record.nextBillingAt) : null,
            trialEndsAt: record.trialEndsAt,
            autoRenew: record.autoRenew,
            status: this.toControlPlaneSubscriptionStatus(record.status),
            createdAt: now,
        });
        return created;
    }
    async findPlanById(id) {
        const [record] = await this.db
            .select({
            id: subscriptionPlansTable.id,
            name: subscriptionPlansTable.name,
            code: subscriptionPlansTable.code,
            description: subscriptionPlansTable.description,
            monthlyPrice: subscriptionPlansTable.monthlyPrice,
            annualPrice: subscriptionPlansTable.annualPrice,
            currencyCode: subscriptionPlansTable.currencyCode,
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
            createdAt: subscriptionPlansTable.createdAt,
            updatedAt: subscriptionPlansTable.updatedAt,
        })
            .from(subscriptionPlansTable)
            .where(eq(subscriptionPlansTable.id, id))
            .limit(1);
        return record ?? null;
    }
    async findCurrentSubscription(userId) {
        const [record] = await this.db
            .select()
            .from(billingSubscriptionsTable)
            .where(and(eq(billingSubscriptionsTable.userId, userId), isNull(billingSubscriptionsTable.cancelledAt)))
            .orderBy(desc(billingSubscriptionsTable.createdAt))
            .limit(1);
        if (record) {
            return record;
        }
        const [controlPlaneRecord] = await this.db
            .select()
            .from(subscriptionsTable)
            .where(and(eq(subscriptionsTable.userId, userId), isNull(subscriptionsTable.cancelledAt)))
            .orderBy(desc(subscriptionsTable.createdAt))
            .limit(1);
        return controlPlaneRecord ? this.mapControlPlaneSubscription(controlPlaneRecord) : null;
    }
    async hasUsedTrial(userId) {
        const [billingTrial] = await this.db
            .select({ id: billingSubscriptionsTable.id })
            .from(billingSubscriptionsTable)
            .where(and(eq(billingSubscriptionsTable.userId, userId), or(sql `${billingSubscriptionsTable.trialEndsAt} is not null`, eq(billingSubscriptionsTable.status, SubscriptionState.Trial))))
            .limit(1);
        if (billingTrial) {
            return true;
        }
        const [controlPlaneTrial] = await this.db
            .select({ id: subscriptionsTable.id })
            .from(subscriptionsTable)
            .where(and(eq(subscriptionsTable.userId, userId), or(sql `${subscriptionsTable.trialEndsAt} is not null`, eq(subscriptionsTable.status, "trial"))))
            .limit(1);
        return Boolean(controlPlaneTrial);
    }
    async listSubscriptions(userId, query) {
        const billingWhere = and(eq(billingSubscriptionsTable.userId, userId), query.status ? eq(billingSubscriptionsTable.status, query.status) : undefined, query.search ? ilike(billingSubscriptionsTable.gatewaySubscriptionId, `%${query.search}%`) : undefined);
        const controlPlaneWhere = and(eq(subscriptionsTable.userId, userId), query.status ? eq(subscriptionsTable.status, query.status) : undefined, query.search ? ilike(subscriptionsTable.subscriptionNumber, `%${query.search}%`) : undefined);
        const billingRecords = await this.db
            .select()
            .from(billingSubscriptionsTable)
            .where(billingWhere)
            .orderBy(desc(billingSubscriptionsTable.createdAt));
        const controlPlaneRecords = await this.db
            .select()
            .from(subscriptionsTable)
            .where(controlPlaneWhere)
            .orderBy(desc(subscriptionsTable.createdAt));
        const recordsById = new Map();
        for (const record of controlPlaneRecords) {
            const mapped = this.mapControlPlaneSubscription(record);
            if (mapped) {
                recordsById.set(mapped.id, mapped);
            }
        }
        for (const record of billingRecords) {
            recordsById.set(record.id, record);
        }
        const records = [...recordsById.values()].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
        const offset = (query.page - 1) * query.limit;
        return {
            items: records.slice(offset, offset + query.limit),
            page: query.page,
            limit: query.limit,
            total: records.length,
        };
    }
    async findSubscriptionById(userId, id) {
        const [record] = await this.db
            .select()
            .from(billingSubscriptionsTable)
            .where(and(eq(billingSubscriptionsTable.userId, userId), eq(billingSubscriptionsTable.id, id)))
            .limit(1);
        if (record) {
            return record;
        }
        const [controlPlaneRecord] = await this.db
            .select()
            .from(subscriptionsTable)
            .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.id, id)))
            .limit(1);
        return controlPlaneRecord ? this.mapControlPlaneSubscription(controlPlaneRecord) : null;
    }
    async updateSubscription(userId, id, patch) {
        const [record] = await this.db
            .update(billingSubscriptionsTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(and(eq(billingSubscriptionsTable.userId, userId), eq(billingSubscriptionsTable.id, id)))
            .returning();
        const controlPlanePatch = this.toControlPlaneSubscriptionPatch(patch);
        if (Object.keys(controlPlanePatch).length > 0) {
            const [controlPlaneRecord] = await this.db
                .update(subscriptionsTable)
                .set(controlPlanePatch)
                .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.id, id)))
                .returning();
            if (!record && controlPlaneRecord) {
                return this.mapControlPlaneSubscription(controlPlaneRecord);
            }
        }
        return record ?? null;
    }
    async createInvoice(record) {
        const now = new Date();
        const [created] = await this.db.insert(billingInvoicesTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async listInvoices(companyId, query) {
        const where = and(eq(billingInvoicesTable.companyId, companyId), query.status ? eq(billingInvoicesTable.status, query.status) : undefined, query.search ? or(ilike(billingInvoicesTable.invoiceNumber, `%${query.search}%`), ilike(billingInvoicesTable.gatewayInvoiceId, `%${query.search}%`)) : undefined, query.fromDate ? gte(billingInvoicesTable.createdAt, query.fromDate) : undefined, query.toDate ? lte(billingInvoicesTable.createdAt, query.toDate) : undefined);
        return this.paginate(billingInvoicesTable, where, query);
    }
    async findInvoiceById(companyId, id) {
        const [record] = await this.db
            .select()
            .from(billingInvoicesTable)
            .where(this.scopedByCompanyOrId(billingInvoicesTable, companyId, id))
            .limit(1);
        return record ?? null;
    }
    async updateInvoice(companyId, id, patch) {
        const [record] = await this.db
            .update(billingInvoicesTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(this.scopedByCompanyOrId(billingInvoicesTable, companyId, id))
            .returning();
        return record ?? null;
    }
    async createPayment(record) {
        const now = new Date();
        const [created] = await this.db.insert(billingPaymentsTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async listPayments(companyId, query) {
        const where = and(eq(billingPaymentsTable.companyId, companyId), query.status ? eq(billingPaymentsTable.status, query.status) : undefined, query.search ? ilike(billingPaymentsTable.gatewayPaymentId, `%${query.search}%`) : undefined);
        return this.paginate(billingPaymentsTable, where, query);
    }
    async findPaymentById(companyId, id) {
        const [record] = await this.db
            .select()
            .from(billingPaymentsTable)
            .where(this.scopedByCompanyOrId(billingPaymentsTable, companyId, id))
            .limit(1);
        return record ?? null;
    }
    async findPaymentByGatewayId(gatewayPaymentId) {
        const [record] = await this.db
            .select()
            .from(billingPaymentsTable)
            .where(eq(billingPaymentsTable.gatewayPaymentId, gatewayPaymentId))
            .limit(1);
        return record ?? null;
    }
    async updatePayment(companyId, id, patch) {
        const [record] = await this.db
            .update(billingPaymentsTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(this.scopedByCompanyOrId(billingPaymentsTable, companyId, id))
            .returning();
        return record ?? null;
    }
    async createSubscriptionChange(record) {
        const now = new Date();
        const [created] = await this.db.insert(billingSubscriptionChangesTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async recordSubscriptionEvent(input) {
        await this.db.insert(billingSubscriptionEventsTable).values({
            id: randomUUID(),
            companyId: input.companyId,
            subscriptionId: input.subscriptionId ?? null,
            eventName: input.eventName,
            entityType: input.entityType,
            entityId: input.entityId,
            payload: input.payload,
            createdBy: input.createdBy ?? null,
            createdAt: new Date(),
        });
    }
    async createRetry(record) {
        const [created] = await this.db.insert(billingPaymentRetriesTable).values({
            ...record,
            id: randomUUID(),
            createdAt: new Date(),
        }).returning();
        return created;
    }
    async listDueRetries(limit) {
        const records = await this.db
            .select()
            .from(billingPaymentRetriesTable)
            .where(and(eq(billingPaymentRetriesTable.status, RetryStatus.Scheduled), lte(billingPaymentRetriesTable.scheduledAt, new Date())))
            .limit(limit);
        return records;
    }
    async updateRetry(companyId, id, patch) {
        const [record] = await this.db
            .update(billingPaymentRetriesTable)
            .set(patch)
            .where(and(eq(billingPaymentRetriesTable.companyId, companyId), eq(billingPaymentRetriesTable.id, id)))
            .returning();
        return record ?? null;
    }
    async countRetriesForPayment(companyId, paymentId) {
        const [record] = await this.db
            .select({ count: sql `count(*)::int` })
            .from(billingPaymentRetriesTable)
            .where(and(eq(billingPaymentRetriesTable.companyId, companyId), eq(billingPaymentRetriesTable.paymentId, paymentId)));
        return Number(record?.count ?? 0);
    }
    async createCredit(record) {
        const now = new Date();
        const [created] = await this.db.insert(billingCreditsTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async listCredits(companyId, query) {
        const where = and(eq(billingCreditsTable.companyId, companyId), query.status ? eq(billingCreditsTable.status, query.status) : undefined, query.search ? ilike(billingCreditsTable.reason, `%${query.search}%`) : undefined);
        return this.paginate(billingCreditsTable, where, query);
    }
    async listAvailableCredits(companyId) {
        const records = await this.db
            .select()
            .from(billingCreditsTable)
            .where(and(eq(billingCreditsTable.companyId, companyId), eq(billingCreditsTable.status, CreditStatus.Available), gte(billingCreditsTable.expiresAt, new Date())))
            .orderBy(desc(billingCreditsTable.expiresAt));
        return records;
    }
    async updateCredit(companyId, id, patch) {
        const [record] = await this.db
            .update(billingCreditsTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(and(eq(billingCreditsTable.companyId, companyId), eq(billingCreditsTable.id, id)))
            .returning();
        return record ?? null;
    }
    async createRefund(record) {
        const now = new Date();
        const [created] = await this.db.insert(billingRefundsTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
        }).returning();
        return created;
    }
    async sumRefundedAmount(companyId, paymentId) {
        const [record] = await this.db
            .select({ total: sql `coalesce(sum(${billingRefundsTable.amount}), 0)::text` })
            .from(billingRefundsTable)
            .where(and(eq(billingRefundsTable.companyId, companyId), eq(billingRefundsTable.paymentId, paymentId)));
        return record?.total ?? "0.00";
    }
    async recordUsage(record) {
        const [created] = await this.db.insert(billingUsageTrackingTable).values({
            ...record,
            id: randomUUID(),
            recordedAt: new Date(),
        }).returning();
        return created;
    }
    async listUsage(companyId, query) {
        const where = and(eq(billingUsageTrackingTable.companyId, companyId), query.search ? ilike(billingUsageTrackingTable.metricName, `%${query.search}%`) : undefined, query.fromDate ? gte(billingUsageTrackingTable.periodStart, query.fromDate) : undefined, query.toDate ? lte(billingUsageTrackingTable.periodEnd, query.toDate) : undefined);
        return this.paginate(billingUsageTrackingTable, where, query);
    }
    async findIdempotencyResponse(companyId, key, payload) {
        const requestHash = IdempotencyUtil.hashPayload(payload);
        const [record] = await this.db
            .select()
            .from(billingIdempotencyKeysTable)
            .where(and(eq(billingIdempotencyKeysTable.companyId, companyId), eq(billingIdempotencyKeysTable.idempotencyKey, key), eq(billingIdempotencyKeysTable.requestHash, requestHash), gte(billingIdempotencyKeysTable.expiresAt, new Date())))
            .limit(1);
        return record?.responseSnapshot ?? null;
    }
    async saveIdempotencyResponse(companyId, key, payload, responseSnapshot) {
        await this.db.insert(billingIdempotencyKeysTable).values({
            id: randomUUID(),
            companyId,
            idempotencyKey: key,
            requestHash: IdempotencyUtil.hashPayload(payload),
            responseSnapshot,
            expiresAt: BillingDateUtil.addHours(new Date(), BILLING_DEFAULTS.idempotencyTtlHours),
            createdAt: new Date(),
        });
    }
    async paginate(table, where, query) {
        const offset = (query.page - 1) * query.limit;
        const items = await this.db.select().from(table).where(where).orderBy(desc(table.createdAt)).limit(query.limit).offset(offset);
        const [countRecord] = await this.db.select({ count: sql `count(*)::int` }).from(table).where(where);
        return {
            items: items,
            page: query.page,
            limit: query.limit,
            total: Number(countRecord?.count ?? 0),
        };
    }
    mapControlPlaneSubscription(record) {
        if (!record.userId || !record.subscriptionPlanId) {
            return null;
        }
        const startDate = this.toDate(record.startDate ?? record.createdAt ?? new Date());
        const currentPeriodEnd = this.toDate(record.endDate ?? record.renewalDate ?? startDate);
        const createdAt = this.toDate(record.createdAt ?? startDate);
        const renewalDate = record.renewalDate ? this.toDate(record.renewalDate) : null;
        return {
            id: record.id,
            userId: record.userId,
            planId: record.subscriptionPlanId,
            previousPlanId: null,
            status: this.normalizeSubscriptionState(record.status),
            billingCycle: this.normalizeBillingCycle(record.billingCycle),
            renewalMode: record.autoRenew ? RenewalMode.Auto : RenewalMode.Manual,
            startDate,
            currentPeriodStart: startDate,
            currentPeriodEnd,
            nextBillingAt: renewalDate,
            graceEndsAt: null,
            trialEndsAt: record.trialEndsAt ? this.toDate(record.trialEndsAt) : null,
            cancelAtPeriodEnd: false,
            cancelledAt: record.cancelledAt ? this.toDate(record.cancelledAt) : null,
            autoRenew: Boolean(record.autoRenew),
            defaultPaymentMethodId: null,
            lastInvoiceId: null,
            gatewayCustomerId: null,
            gatewaySubscriptionId: null,
            purchasedPlanSnapshot: {
                source: "subscriptions",
                subscriptionNumber: record.subscriptionNumber,
                cancellationReason: record.cancellationReason,
            },
            purchasedPriceAmount: "0",
            purchasedCurrencyCode: BILLING_DEFAULTS.currencyCode,
            purchasedDurationMonths: this.calculateDurationMonths(startDate, currentPeriodEnd),
            metadata: {
                source: "control_plane_subscription",
            },
            createdAt,
            updatedAt: createdAt,
        };
    }
    normalizeSubscriptionState(value) {
        const normalized = (value ?? SubscriptionState.Active).toUpperCase();
        if (normalized === "CANCELED") {
            return SubscriptionState.Cancelled;
        }
        return Object.values(SubscriptionState).includes(normalized)
            ? normalized
            : SubscriptionState.Active;
    }
    toControlPlaneSubscriptionPatch(patch) {
        const result = {};
        if (patch.planId)
            result.subscriptionPlanId = patch.planId;
        if (patch.billingCycle)
            result.billingCycle = this.toControlPlaneBillingCycle(patch.billingCycle);
        if (patch.status)
            result.status = this.toControlPlaneSubscriptionStatus(patch.status);
        if (patch.currentPeriodStart)
            result.startDate = this.toDateString(patch.currentPeriodStart);
        if (patch.currentPeriodEnd) {
            result.endDate = this.toDateString(patch.currentPeriodEnd);
            result.renewalDate = this.toDateString(patch.currentPeriodEnd);
        }
        if (typeof patch.autoRenew === "boolean")
            result.autoRenew = patch.autoRenew;
        if (patch.trialEndsAt !== undefined)
            result.trialEndsAt = patch.trialEndsAt;
        if (patch.cancelledAt !== undefined)
            result.cancelledAt = patch.cancelledAt;
        if (patch.cancelAtPeriodEnd !== undefined && patch.cancelAtPeriodEnd) {
            result.cancellationReason = "cancel_at_period_end";
        }
        return result;
    }
    toControlPlaneBillingCycle(value) {
        if (value === BillingCycle.Yearly)
            return "annual";
        if (value === BillingCycle.Annual)
            return "annual";
        if (value === BillingCycle.Quarterly)
            return "quarterly";
        if (value === BillingCycle.Trial)
            return "monthly";
        return "monthly";
    }
    toControlPlaneSubscriptionStatus(value) {
        if (value === SubscriptionState.Active)
            return "active";
        if (value === SubscriptionState.Trial)
            return "trial_active";
        if (value === SubscriptionState.Cancelled)
            return "cancelled";
        if (value === SubscriptionState.PastDue)
            return "past_due";
        if (value === SubscriptionState.Suspended)
            return "suspended";
        return value.toLowerCase();
    }
    toDateString(value) {
        return value.toISOString().slice(0, 10);
    }
    normalizeBillingCycle(value) {
        const normalized = (value ?? BillingCycle.Monthly).toLowerCase();
        return Object.values(BillingCycle).includes(normalized)
            ? normalized
            : BillingCycle.Monthly;
    }
    calculateDurationMonths(startDate, endDate) {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();
        return Math.max(1, months);
    }
    async createPaymentProfile(record) {
        const now = new Date();
        if (record.isDefault) {
            await this.clearDefaultPaymentProfiles(record.companyId, record.userId);
        }
        const [created] = await this.db.insert(billingPaymentProfilesTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        }).returning();
        return created;
    }
    async listPaymentProfiles(companyId, userId) {
        const conditions = [isNull(billingPaymentProfilesTable.deletedAt)];
        if (userId) {
            conditions.push(eq(billingPaymentProfilesTable.userId, userId));
        }
        if (companyId) {
            conditions.push(eq(billingPaymentProfilesTable.companyId, companyId));
        }
        const records = await this.db
            .select()
            .from(billingPaymentProfilesTable)
            .where(and(...conditions))
            .orderBy(desc(billingPaymentProfilesTable.isDefault), desc(billingPaymentProfilesTable.createdAt));
        return records;
    }
    async findPaymentProfileById(companyId, id, userId) {
        const conditions = [
            eq(billingPaymentProfilesTable.id, id),
            isNull(billingPaymentProfilesTable.deletedAt)
        ];
        if (userId) {
            conditions.push(eq(billingPaymentProfilesTable.userId, userId));
        }
        if (companyId) {
            conditions.push(eq(billingPaymentProfilesTable.companyId, companyId));
        }
        const [record] = await this.db
            .select()
            .from(billingPaymentProfilesTable)
            .where(and(...conditions))
            .limit(1);
        return record ?? null;
    }
    async updatePaymentProfile(companyId, id, patch, userId) {
        if (patch.isDefault) {
            await this.clearDefaultPaymentProfiles(companyId, userId);
        }
        const conditions = [
            eq(billingPaymentProfilesTable.id, id),
            isNull(billingPaymentProfilesTable.deletedAt)
        ];
        if (userId) {
            conditions.push(eq(billingPaymentProfilesTable.userId, userId));
        }
        if (companyId) {
            conditions.push(eq(billingPaymentProfilesTable.companyId, companyId));
        }
        const [record] = await this.db
            .update(billingPaymentProfilesTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(and(...conditions))
            .returning();
        return record ?? null;
    }
    async removePaymentProfile(companyId, id, userId) {
        const conditions = [
            eq(billingPaymentProfilesTable.id, id),
            isNull(billingPaymentProfilesTable.deletedAt)
        ];
        if (userId) {
            conditions.push(eq(billingPaymentProfilesTable.userId, userId));
        }
        if (companyId) {
            conditions.push(eq(billingPaymentProfilesTable.companyId, companyId));
        }
        const [record] = await this.db
            .update(billingPaymentProfilesTable)
            .set({ deletedAt: new Date(), updatedAt: new Date(), isDefault: false })
            .where(and(...conditions))
            .returning();
        return record ?? null;
    }
    async countActivePaymentProfiles(companyId, userId) {
        const conditions = [isNull(billingPaymentProfilesTable.deletedAt)];
        if (userId) {
            conditions.push(eq(billingPaymentProfilesTable.userId, userId));
        }
        if (companyId) {
            conditions.push(eq(billingPaymentProfilesTable.companyId, companyId));
        }
        const [record] = await this.db
            .select({ count: sql `count(*)::int` })
            .from(billingPaymentProfilesTable)
            .where(and(...conditions));
        return Number(record?.count ?? 0);
    }
    async clearDefaultPaymentProfiles(companyId, userId) {
        const conditions = [isNull(billingPaymentProfilesTable.deletedAt)];
        if (userId) {
            conditions.push(eq(billingPaymentProfilesTable.userId, userId));
        }
        if (companyId) {
            conditions.push(eq(billingPaymentProfilesTable.companyId, companyId));
        }
        await this.db
            .update(billingPaymentProfilesTable)
            .set({ isDefault: false, updatedAt: new Date() })
            .where(and(...conditions));
    }
    async updateInvoiceCompanyId(id, companyId) {
        await this.db
            .update(billingInvoicesTable)
            .set({ companyId, updatedAt: new Date() })
            .where(eq(billingInvoicesTable.id, id));
    }
    async updatePaymentCompanyId(id, companyId) {
        await this.db
            .update(billingPaymentsTable)
            .set({ companyId, updatedAt: new Date() })
            .where(eq(billingPaymentsTable.id, id));
    }
    toDate(value) {
        return value instanceof Date ? value : new Date(value);
    }
    scopedByCompanyOrId(table, companyId, id) {
        return companyId
            ? and(eq(table.companyId, companyId), eq(table.id, id))
            : eq(table.id, id);
    }
}

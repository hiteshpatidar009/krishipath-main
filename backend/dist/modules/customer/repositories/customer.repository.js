import { randomUUID } from "crypto";
import { and, asc, desc, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database/postgres/connections/db2.connection";
import { salesOrdersTable } from "../../../infrastructure/database/postgres/schemas/db2/all.schema";
import { customerAddressesTable, customerCreditLimitsTable, customerGroupsTable, customerNotesTable, customerPricingRulesTable, customersTable, customerShippingPreferencesTable, customerTaxExemptionsTable, } from "../schemas/customer.schema";
export class CustomerRepository {
    db;
    constructor(db) {
        this.db = db ?? Db2Connection.getInstance();
    }
    async transaction(callback) {
        return this.db.transaction(async (tx) => callback(new CustomerRepository(tx)));
    }
    async createCustomer(record) {
        const now = new Date();
        const [created] = await this.db.insert(customersTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            version: 1,
        }).returning();
        return created;
    }
    async listCustomers(companyId, query) {
        const where = and(eq(customersTable.companyId, companyId), isNull(customersTable.deletedAt), query.status ? eq(customersTable.status, query.status) : undefined, query.groupId ? eq(customersTable.customerGroupId, query.groupId) : undefined, query.customerType ? eq(customersTable.customerType, query.customerType) : undefined, query.companyName ? ilike(customersTable.companyName, `%${query.companyName}%`) : undefined, query.hasPortalAccess === undefined ? undefined : eq(customersTable.portalEnabled, query.hasPortalAccess), query.cursor ? gt(customersTable.id, query.cursor) : undefined, query.search ? or(ilike(customersTable.customerName, `%${query.search}%`), ilike(customersTable.email, `%${query.search}%`), ilike(customersTable.phone, `%${query.search}%`), ilike(customersTable.companyName, `%${query.search}%`), ilike(customersTable.customerCode, `%${query.search}%`)) : undefined);
        return this.paginate(customersTable, where, query);
    }
    async findCustomerById(companyId, id) {
        const [record] = await this.db
            .select()
            .from(customersTable)
            .where(and(eq(customersTable.companyId, companyId), eq(customersTable.id, id), isNull(customersTable.deletedAt)))
            .limit(1);
        return record ?? null;
    }
    async findCustomerByCode(companyId, customerCode) {
        const [record] = await this.db
            .select()
            .from(customersTable)
            .where(and(eq(customersTable.companyId, companyId), eq(customersTable.customerCode, customerCode), isNull(customersTable.deletedAt)))
            .limit(1);
        return record ?? null;
    }
    async getCustomerProfile(companyId, id) {
        const customer = await this.findCustomerById(companyId, id);
        if (!customer) {
            return null;
        }
        const [addresses, creditLimit, shippingPreference, taxExemptions] = await Promise.all([
            this.listAddresses(companyId, id),
            this.getActiveCreditLimit(companyId, id),
            this.getShippingPreference(companyId, id),
            this.listTaxExemptions(companyId, id),
        ]);
        return { ...customer, addresses, creditLimit, shippingPreference, taxExemptions };
    }
    async updateCustomer(companyId, id, patch) {
        const [record] = await this.db
            .update(customersTable)
            .set({ ...patch, updatedAt: new Date(), version: sql `${customersTable.version} + 1` })
            .where(and(eq(customersTable.companyId, companyId), eq(customersTable.id, id), isNull(customersTable.deletedAt)))
            .returning();
        return record ?? null;
    }
    async softDeleteCustomer(companyId, id, userId) {
        const [record] = await this.db
            .update(customersTable)
            .set({ deletedAt: new Date(), updatedAt: new Date(), updatedBy: userId, version: sql `${customersTable.version} + 1` })
            .where(and(eq(customersTable.companyId, companyId), eq(customersTable.id, id), isNull(customersTable.deletedAt)))
            .returning();
        return record ?? null;
    }
    async createAddress(record) {
        const now = new Date();
        const [created] = await this.db.insert(customerAddressesTable).values({
            ...record,
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        }).returning();
        return created;
    }
    async listAddresses(companyId, customerId) {
        const records = await this.db
            .select()
            .from(customerAddressesTable)
            .where(and(eq(customerAddressesTable.companyId, companyId), eq(customerAddressesTable.customerId, customerId), isNull(customerAddressesTable.deletedAt)))
            .orderBy(desc(customerAddressesTable.createdAt));
        return records;
    }
    async findAddress(companyId, customerId, addressId) {
        const [record] = await this.db
            .select()
            .from(customerAddressesTable)
            .where(and(eq(customerAddressesTable.companyId, companyId), eq(customerAddressesTable.customerId, customerId), eq(customerAddressesTable.id, addressId), isNull(customerAddressesTable.deletedAt)))
            .limit(1);
        return record ?? null;
    }
    async clearDefaultBillingAddress(companyId, customerId, exceptAddressId) {
        await this.db
            .update(customerAddressesTable)
            .set({ isDefaultBilling: false, updatedAt: new Date() })
            .where(and(eq(customerAddressesTable.companyId, companyId), eq(customerAddressesTable.customerId, customerId), exceptAddressId ? sql `${customerAddressesTable.id} <> ${exceptAddressId}` : undefined));
    }
    async clearDefaultShippingAddress(companyId, customerId, exceptAddressId) {
        await this.db
            .update(customerAddressesTable)
            .set({ isDefaultShipping: false, updatedAt: new Date() })
            .where(and(eq(customerAddressesTable.companyId, companyId), eq(customerAddressesTable.customerId, customerId), exceptAddressId ? sql `${customerAddressesTable.id} <> ${exceptAddressId}` : undefined));
    }
    async updateAddress(companyId, customerId, addressId, patch) {
        const [record] = await this.db
            .update(customerAddressesTable)
            .set({ ...patch, updatedAt: new Date() })
            .where(and(eq(customerAddressesTable.companyId, companyId), eq(customerAddressesTable.customerId, customerId), eq(customerAddressesTable.id, addressId), isNull(customerAddressesTable.deletedAt)))
            .returning();
        return record ?? null;
    }
    async deleteAddress(companyId, customerId, addressId) {
        const [record] = await this.db
            .update(customerAddressesTable)
            .set({ deletedAt: new Date(), updatedAt: new Date(), isDefaultBilling: false, isDefaultShipping: false })
            .where(and(eq(customerAddressesTable.companyId, companyId), eq(customerAddressesTable.customerId, customerId), eq(customerAddressesTable.id, addressId), isNull(customerAddressesTable.deletedAt)))
            .returning();
        return record ?? null;
    }
    async createGroup(record) {
        const now = new Date();
        const [created] = await this.db.insert(customerGroupsTable).values({ ...record, id: randomUUID(), createdAt: now, updatedAt: now }).returning();
        return created;
    }
    async listGroups(companyId, query) {
        const where = and(eq(customerGroupsTable.companyId, companyId), query.search ? or(ilike(customerGroupsTable.groupCode, `%${query.search}%`), ilike(customerGroupsTable.groupName, `%${query.search}%`)) : undefined);
        return this.paginate(customerGroupsTable, where, query);
    }
    async upsertCreditLimit(record) {
        const now = new Date();
        await this.db
            .update(customerCreditLimitsTable)
            .set({ effectiveTo: now, updatedAt: now, updatedBy: record.updatedBy })
            .where(and(eq(customerCreditLimitsTable.companyId, record.companyId), eq(customerCreditLimitsTable.customerId, record.customerId), isNull(customerCreditLimitsTable.effectiveTo)));
        const [created] = await this.db.insert(customerCreditLimitsTable).values({ ...record, id: randomUUID(), createdAt: now, updatedAt: now }).returning();
        return created;
    }
    async getActiveCreditLimit(companyId, customerId) {
        const [record] = await this.db
            .select()
            .from(customerCreditLimitsTable)
            .where(and(eq(customerCreditLimitsTable.companyId, companyId), eq(customerCreditLimitsTable.customerId, customerId), isNull(customerCreditLimitsTable.effectiveTo)))
            .limit(1);
        return record ?? null;
    }
    async createPricingRule(record) {
        const now = new Date();
        const [created] = await this.db.insert(customerPricingRulesTable).values({ ...record, id: randomUUID(), createdAt: now, updatedAt: now }).returning();
        return created;
    }
    async createNote(record) {
        const [created] = await this.db.insert(customerNotesTable).values({ ...record, id: randomUUID(), createdAt: new Date() }).returning();
        return created;
    }
    async upsertTaxExemption(record) {
        const now = new Date();
        const [created] = await this.db.insert(customerTaxExemptionsTable).values({ ...record, id: randomUUID(), createdAt: now, updatedAt: now }).returning();
        return created;
    }
    async listTaxExemptions(companyId, customerId) {
        const records = await this.db
            .select()
            .from(customerTaxExemptionsTable)
            .where(and(eq(customerTaxExemptionsTable.companyId, companyId), eq(customerTaxExemptionsTable.customerId, customerId), eq(customerTaxExemptionsTable.isActive, true)))
            .orderBy(desc(customerTaxExemptionsTable.expiresAt));
        return records;
    }
    async upsertShippingPreference(record) {
        const existing = await this.getShippingPreference(record.companyId, record.customerId);
        const now = new Date();
        if (existing) {
            const [updated] = await this.db
                .update(customerShippingPreferencesTable)
                .set({ ...record, updatedAt: now })
                .where(and(eq(customerShippingPreferencesTable.companyId, record.companyId), eq(customerShippingPreferencesTable.customerId, record.customerId)))
                .returning();
            return updated;
        }
        const [created] = await this.db.insert(customerShippingPreferencesTable).values({ ...record, id: randomUUID(), createdAt: now, updatedAt: now }).returning();
        return created;
    }
    async getShippingPreference(companyId, customerId) {
        try {
            const [record] = await this.db
                .select()
                .from(customerShippingPreferencesTable)
                .where(and(eq(customerShippingPreferencesTable.companyId, companyId), eq(customerShippingPreferencesTable.customerId, customerId)))
                .limit(1);
            return record ?? null;
        }
        catch (error) {
            if (this.isMissingOptionalRelationError(error)) {
                return null;
            }
            throw error;
        }
    }
    async listOrderHistory(companyId, customerId, query) {
        const where = and(eq(salesOrdersTable.companyId, companyId), eq(salesOrdersTable.customerId, customerId));
        return this.paginate(salesOrdersTable, where, query);
    }
    async paginate(table, where, query) {
        const offset = (query.page - 1) * query.limit;
        const sortColumn = this.sortColumn(table, query.sortBy);
        const order = query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
        const items = await this.db.select().from(table).where(where).orderBy(order).limit(query.limit).offset(offset);
        const [countRecord] = await this.db.select({ count: sql `count(*)::int` }).from(table).where(where);
        return {
            items: items,
            page: query.page,
            limit: query.limit,
            total: Number(countRecord?.count ?? 0),
            nextCursor: items.length === query.limit ? items[items.length - 1]?.id : undefined,
        };
    }
    sortColumn(table, sortBy) {
        if (sortBy && table[sortBy]) {
            return table[sortBy];
        }
        return table.createdAt ?? table.id;
    }
    isMissingOptionalRelationError(error) {
        const dbError = error;
        return (dbError.code === "42P01" ||
            dbError.code === "42703" ||
            dbError.cause?.code === "42P01" ||
            dbError.cause?.code === "42703");
    }
}

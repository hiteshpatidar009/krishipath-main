import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const enterpriseMembershipsTable = pgTable("enterprise_memberships", {
  id: uuid("id").primaryKey(),
  enterpriseId: uuid("enterprise_id").notNull(),
  userId: uuid("user_id").notNull(),
  roleId: uuid("role_id"),
  permissionKeys: jsonb("permission_keys").$type<string[]>().notNull().default([]),
  status: varchar("status").notNull().default("ACTIVE"),
  invitationSource: varchar("invitation_source"),
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const companyMembershipsTable = pgTable("company_memberships", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  enterpriseId: uuid("enterprise_id"),
  userId: uuid("user_id").notNull(),
  roleId: uuid("role_id"),
  permissionKeys: jsonb("permission_keys").$type<string[]>().notNull().default([]),
  status: varchar("status").notNull().default("ACTIVE"),
  invitationSource: varchar("invitation_source"),
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const organizationMembershipsTable = pgTable("organization_memberships", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  companyId: uuid("company_id").notNull(),
  userId: uuid("user_id").notNull(),
  roleId: uuid("role_id"),
  permissionKeys: jsonb("permission_keys").$type<string[]>().notNull().default([]),
  status: varchar("status").notNull().default("ACTIVE"),
  invitationSource: varchar("invitation_source"),
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const warehouseMembershipsTable = pgTable("warehouse_memberships", {
  id: uuid("id").primaryKey(),
  warehouseId: uuid("warehouse_id").notNull(),
  organizationId: uuid("organization_id").notNull(),
  companyId: uuid("company_id").notNull(),
  userId: uuid("user_id").notNull(),
  roleId: uuid("role_id"),
  permissionKeys: jsonb("permission_keys").$type<string[]>().notNull().default([]),
  status: varchar("status").notNull().default("ACTIVE"),
  invitationSource: varchar("invitation_source"),
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const planLimitsTable = pgTable("plan_limits", {
  id: uuid("id").primaryKey(),
  planId: uuid("plan_id").notNull(),
  maxEnterprises: integer("max_enterprises"),
  maxCompaniesPerEnterprise: integer("max_companies_per_enterprise"),
  maxStandaloneCompanies: integer("max_standalone_companies"),
  maxOrganizationsPerCompany: integer("max_organizations_per_company"),
  maxWarehousesPerOrganization: integer("max_warehouses_per_organization"),
  maxUsers: integer("max_users"),
  maxStorageBytes: integer("max_storage_bytes"),
  maxApiRequests: integer("max_api_requests"),
  maxIntegrations: integer("max_integrations"),
  trialDays: integer("trial_days"),
  customLimitsAllowed: boolean("custom_limits_allowed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usageCountersTable = pgTable("usage_counters", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  enterpriseId: uuid("enterprise_id"),
  companyId: uuid("company_id"),
  organizationId: uuid("organization_id"),
  warehouseId: uuid("warehouse_id"),
  counterKey: varchar("counter_key").notNull(),
  counterValue: integer("counter_value").notNull().default(0),
  refreshedAt: timestamp("refreshed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const membershipAuditTable = pgTable("membership_audit", {
  id: uuid("id").primaryKey(),
  membershipId: uuid("membership_id"),
  membershipType: varchar("membership_type").notNull(),
  userId: uuid("user_id").notNull(),
  enterpriseId: uuid("enterprise_id"),
  companyId: uuid("company_id"),
  organizationId: uuid("organization_id"),
  warehouseId: uuid("warehouse_id"),
  action: varchar("action").notNull(),
  result: varchar("result").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  requestId: varchar("request_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

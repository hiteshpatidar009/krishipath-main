import { boolean, integer, jsonb, numeric, pgTable, text, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";
import { statesTable, districtsTable, mandisTable, productsTable, usersTable } from "./all.schema";
export const marketSourcesTable = pgTable("market_sources", {
    id: uuid("id").primaryKey().defaultRandom(),
    businessName: varchar("business_name").notNull(),
    ownerName: varchar("owner_name").notNull(),
    mobileNumber: varchar("mobile_number").notNull(),
    whatsappNumber: varchar("whatsapp_number"), // Strict E.164 format
    whatsappGroupId: varchar("whatsapp_group_id"),
    alternativeNumber: varchar("alternative_number"),
    email: varchar("email"),
    mandiId: uuid("mandi_id").references(() => mandisTable.id),
    stateId: uuid("state_id").references(() => statesTable.id),
    districtId: uuid("district_id").references(() => districtsTable.id),
    address: text("address"),
    languages: jsonb("languages"), // array of language codes
    productsDealingIn: jsonb("products_dealing_in"), // String names from UI temporarily
    notes: text("notes"),
    status: varchar("status").notNull().default("ACTIVE"),
    sourceType: varchar("source_type").notNull().default("WHATSAPP"), // MANUAL, WHATSAPP, CSV, GOVERNMENT, API
    trustScore: integer("trust_score").default(0),
    parserAccuracy: numeric("parser_accuracy").default('0'),
    loginEnabled: boolean("login_enabled").notNull().default(false),
    userId: uuid("user_id").references(() => usersTable.id), // For future login
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const marketSourceProductsTable = pgTable("market_source_products", {
    id: uuid("id").primaryKey().defaultRandom(),
    marketSourceId: uuid("market_source_id").notNull().references(() => marketSourcesTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => productsTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const marketSourceMandisTable = pgTable("market_source_mandis", {
    id: uuid("id").primaryKey().defaultRandom(),
    marketSourceId: uuid("market_source_id").notNull().references(() => marketSourcesTable.id, { onDelete: "cascade" }),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const marketSourceParserProfilesTable = pgTable("market_source_parser_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    marketSourceId: uuid("market_source_id").notNull().unique().references(() => marketSourcesTable.id, { onDelete: "cascade" }),
    isAutomationEnabled: boolean("is_automation_enabled").default(false),
    parserVersion: varchar("parser_version"),
    language: varchar("language").default("hi"),
    messageTemplate: varchar("message_template"),
    defaultUnit: varchar("default_unit").default("QUINTAL"),
    supportedCrops: jsonb("supported_crops"), // Array of crop UUIDs
    gradeMapping: jsonb("grade_mapping"), // Object mapping grade name -> standard grade
    unknownWords: jsonb("unknown_words"), // Array of objects mapping word to occurrences
    mappedAliases: jsonb("mapped_aliases"), // Object mapping local name -> standard ID
    failedMessages: integer("failed_messages").default(0),
    successRate: numeric("success_rate").default('0'),
    learnedKeywords: jsonb("learned_keywords"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const marketSourceTimelineTable = pgTable("market_source_timeline", {
    id: uuid("id").primaryKey().defaultRandom(),
    marketSourceId: uuid("market_source_id").notNull().references(() => marketSourcesTable.id, { onDelete: "cascade" }),
    activityType: varchar("activity_type").notNull(), // CREATED, PROFILE_UPDATED, MESSAGE_PARSED, PARSER_UPDATED, LOGIN_ENABLED
    description: text("description"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const marketSourceAnalyticsTable = pgTable("market_source_analytics", {
    id: uuid("id").primaryKey().defaultRandom(),
    marketSourceId: uuid("market_source_id").notNull().unique().references(() => marketSourcesTable.id, { onDelete: "cascade" }),
    totalMessages: integer("total_messages").default(0),
    totalParsedPrices: integer("total_parsed_prices").default(0),
    productsCovered: integer("products_covered").default(0),
    averageAiConfidence: numeric("average_ai_confidence").default('0'),
    averageDailyMessages: numeric("average_daily_messages").default('0'),
    mostReportedProductId: uuid("most_reported_product_id").references(() => productsTable.id),
    monthlyActivity: jsonb("monthly_activity"), // Stats by month
    lastActive: timestamp("last_active"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

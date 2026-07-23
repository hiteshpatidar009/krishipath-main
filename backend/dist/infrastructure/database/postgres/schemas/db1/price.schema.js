import { integer, numeric, pgTable, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";
import { mandisTable, productsTable, productVariantsTable } from "./all.schema";
import { marketSourcesTable } from "./market-source.schema";
export const priceSubmissionsTable = pgTable("price_submissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    marketSourceId: uuid("market_source_id").notNull().references(() => marketSourcesTable.id),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    productId: uuid("product_id").notNull().references(() => productsTable.id),
    variantId: uuid("variant_id").notNull().references(() => productVariantsTable.id),
    unit: varchar("unit").notNull(),
    minPrice: numeric("min_price"),
    maxPrice: numeric("max_price"),
    modalPrice: numeric("modal_price"),
    aiConfidence: integer("ai_confidence"),
    source: varchar("source").notNull().default("WHATSAPP_AI"), // WHATSAPP_AI, MANUAL, GOVT_API
    status: varchar("status").notNull().default("PENDING"), // PENDING, VERIFIED, REJECTED
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const mandiReferencePricesTable = pgTable("mandi_reference_prices", {
    id: uuid("id").primaryKey().defaultRandom(),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    productId: uuid("product_id").notNull().references(() => productsTable.id),
    variantId: uuid("variant_id").notNull().references(() => productVariantsTable.id),
    unit: varchar("unit").notNull(),
    refMinPrice: numeric("ref_min_price"),
    refMaxPrice: numeric("ref_max_price"),
    refAvgPrice: numeric("ref_avg_price"),
    traderCount: integer("trader_count").notNull().default(0),
    weightedConfidence: numeric("weighted_confidence"),
    lastCalculatedAt: timestamp("last_calculated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

const fs = require('fs');

const path = 'src/infrastructure/database/postgres/schemas/db1/all.schema.ts';
let content = fs.readFileSync(path, 'utf8');

// Rename the DB table names (since variables were renamed by the previous script)
content = content.replace(/pgTable\("crops"/g, 'pgTable("products"');
content = content.replace(/pgTable\("mandi_crops"/g, 'pgTable("mandi_products"');
content = content.replace(/pgTable\("crop_variants"/g, 'pgTable("product_variants"'); // Just in case

// We'll append the new schemas before the relationships declarations
const newSchemas = `
// ==========================================
// MASTER DATA MANAGEMENT (MDM) & PIM
// ==========================================

export const conceptDictionaryTable = pgTable("concept_dictionary", {
  id: uuid("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // PRODUCT, VARIANT, CATEGORY, UNIT
  entityId: uuid("entity_id").notNull(),
  term: varchar("term").notNull(),
  languageCode: varchar("language_code"),
  traderId: uuid("trader_id").references((): AnyPgColumn => usersTable.id), // Link to usersTable for now (trader is a user)
  confidenceWeight: integer("confidence_weight").default(100),
});

export const traderParserProfilesTable = pgTable("trader_parser_profiles", {
  id: uuid("id").primaryKey(),
  traderId: uuid("trader_id").notNull().references((): AnyPgColumn => usersTable.id),
  separatorTokens: jsonb("separator_tokens"),
  aliasMappings: jsonb("alias_mappings"),
  confidenceRules: jsonb("confidence_rules"), 
});

export const feedSourcesTable = pgTable("feed_sources", {
  id: uuid("id").primaryKey(),
  traderId: uuid("trader_id").notNull().references((): AnyPgColumn => usersTable.id),
  sourceType: varchar("source_type").notNull(), // WHATSAPP, PORTAL, API
  sourceIdentifier: varchar("source_identifier"),
});

export const rawMarketMessagesTable = pgTable("raw_market_messages", {
  id: uuid("id").primaryKey(),
  feedSourceId: uuid("feed_source_id").notNull().references((): AnyPgColumn => feedSourcesTable.id),
  rawText: text("raw_text").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  extractedJson: jsonb("extracted_json"),
  parserVersion: varchar("parser_version"),
  confidenceScore: integer("confidence_score"),
  status: varchar("status"), // PENDING, PARSED, VALIDATION_FAILED, REJECTED, APPROVED
  validationErrors: jsonb("validation_errors"),
});

export const traderPriceHistoryTable = pgTable("trader_price_history", {
  id: uuid("id").primaryKey(),
  rawMessageId: uuid("raw_message_id").references((): AnyPgColumn => rawMarketMessagesTable.id),
  traderId: uuid("trader_id").references((): AnyPgColumn => usersTable.id),
  mandiId: uuid("mandi_id").notNull().references((): AnyPgColumn => mandisTable.id),
  variantId: uuid("variant_id").notNull().references((): AnyPgColumn => productVariantsTable.id),
  priceMin: numeric("price_min"),
  priceMax: numeric("price_max"),
  priceModal: numeric("price_modal").notNull(),
  confidenceScore: integer("confidence_score"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  status: varchar("status").notNull().default("ACTIVE"),
});

export const priceAggregationsTable = pgTable("price_aggregations", {
  id: uuid("id").primaryKey(),
  mandiId: uuid("mandi_id").notNull().references((): AnyPgColumn => mandisTable.id),
  variantId: uuid("variant_id").notNull().references((): AnyPgColumn => productVariantsTable.id),
  date: timestamp("date").notNull(),
  liveAverage: numeric("live_average"),
  highestPrice: numeric("highest_price"),
  lowestPrice: numeric("lowest_price"),
  medianPrice: numeric("median_price"),
  activeTraderCount: integer("active_trader_count"),
  aggregatedAt: timestamp("aggregated_at").defaultNow(),
});
`;

if (!content.includes('conceptDictionaryTable')) {
  // Find a good spot to insert. Before the 'export const usersRelations' is usually safe
  const insertIndex = content.indexOf('export const usersRelations');
  if (insertIndex !== -1) {
    content = content.slice(0, insertIndex) + newSchemas + '\n' + content.slice(insertIndex);
  } else {
    content += '\n' + newSchemas;
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully added new schemas");

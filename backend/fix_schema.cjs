const fs = require('fs');

const path = 'src/infrastructure/database/postgres/schemas/db1/all.schema.ts';
let content = fs.readFileSync(path, 'utf8');

// Add subcategoryId
content = content.replace('  imageUrl: varchar("image_url"),', '  subcategoryId: uuid("subcategory_id"),\n  imageUrl: varchar("image_url"),');

// Add productVariantsTable
const variantsTable = `
export const productVariantsTable = pgTable("product_variants", {
  id: uuid("id").primaryKey(),
  productId: uuid("product_id").notNull().references((): AnyPgColumn => cropsTable.id),
  gradeName: varchar("grade_name").notNull(),
  unit: varchar("unit").notNull(), // e.g., QUINTAL, KG
  status: varchar("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
`;

content = content.replace('export const masterDataItemsTable', variantsTable + '\nexport const masterDataItemsTable');

fs.writeFileSync(path, content);
console.log("Successfully inserted subcategoryId and productVariantsTable");

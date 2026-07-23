import { randomUUID } from "crypto";
import { Db1Connection } from "../src/infrastructure/database/postgres/connections/db1.connection";
import { productsTable, entityTranslationsTable, mandiProductsTable, mandisTable } from "../src/infrastructure/database/postgres/schemas/db1/all.schema";
import { eq, inArray } from "drizzle-orm";

const cropsData = [
  {
    name: "Wheat",
    translations: {
      hi: "गेहूँ",
      mr: "गहू",
      gu: "ઘઉં",
      te: "గోధుమ"
    }
  },
  {
    name: "Soyabean",
    translations: {
      hi: "सोयाबीन",
      mr: "सोयाबीन",
      gu: "સોયાબીન",
      te: "సోయాబీన్"
    }
  },
  {
    name: "Cotton",
    translations: {
      hi: "कपास",
      mr: "कापूस",
      gu: "કપાસ",
      te: "పత్తి"
    }
  },
  {
    name: "Gram",
    translations: {
      hi: "चना",
      mr: "हरभरा",
      gu: "ચણા",
      te: "శనగ"
    }
  },
  {
    name: "Maize",
    translations: {
      hi: "मक्का",
      mr: "मका",
      gu: "મકાઈ",
      te: "మొక్కజొన్న"
    }
  }
];

async function seed() {
  const db = Db1Connection.getInstance();
  console.log("Connected to DB1");

  // 1. Delete dummy crops (newmotor, onion, etc.)
  console.log("Deleting old products...");
  await db.delete(mandiProductsTable);
  await db.delete(entityTranslationsTable).where(eq(entityTranslationsTable.entityType, "PRODUCT"));
  await db.delete(productsTable);

  // 2. Fetch mandis (Ujjain, Indore, etc. if they exist)
  const mandis = await db.select().from(mandisTable);
  console.log(`Found ${mandis.length} mandis.`);

  // 3. Insert new crops
  console.log("Inserting real crops...");
  let count = 1;
  for (const crop of cropsData) {
    const cropId = randomUUID();
    
    // Insert into productsTable
    await db.insert(productsTable).values({
      id: cropId,
      code: `CRP_${String(count).padStart(6, '0')}`,
      name: crop.name,
      slug: crop.name.toLowerCase(),
      category: "grain",
      status: "ACTIVE"
    });

    // Insert English translation as APPROVED
    await db.insert(entityTranslationsTable).values({
      id: randomUUID(),
      entityType: "PRODUCT",
      entityId: cropId,
      fieldName: "name",
      languageCode: "en",
      value: crop.name,
      status: "APPROVED"
    });

    // Insert other translations
    for (const [lang, val] of Object.entries(crop.translations)) {
      await db.insert(entityTranslationsTable).values({
        id: randomUUID(),
        entityType: "PRODUCT",
        entityId: cropId,
        fieldName: "name",
        languageCode: lang,
        value: val,
        status: "APPROVED"
      });
    }

    // Link to Mandis (Ujjain, Indore, etc.)
    for (const mandi of mandis) {
      // Just link it randomly or link to all
      await db.insert(mandiProductsTable).values({
        id: randomUUID(),
        mandiId: mandi.id,
        productId: cropId,
        isActive: true
      });
    }

    count++;
  }

  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch(console.error);

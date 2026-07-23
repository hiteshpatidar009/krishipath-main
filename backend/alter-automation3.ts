import { config } from "dotenv";
config();
import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";
import { sql } from "drizzle-orm";

async function runMigration() {
  const db = Db1Connection.getInstance();
  try {
    await db.execute(sql`ALTER TABLE market_source_parser_profiles ADD COLUMN IF NOT EXISTS is_automation_enabled BOOLEAN DEFAULT false;`);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

runMigration();

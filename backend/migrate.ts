import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

async function runMigrations() {
  console.log("Starting migrations...");
  try {
    await Db1Connection.connect();
    const db = Db1Connection.getInstance();
    
    // Path to the migrations folder
    const migrationsFolder = resolve(process.cwd(), "database/migrations/db1");
    
    await migrate(db, { migrationsFolder });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await Db1Connection.disconnect();
    process.exit(0);
  }
}

runMigrations();

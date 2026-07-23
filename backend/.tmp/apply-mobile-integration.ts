import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Db1Connection } from "../src/infrastructure/database/postgres/connections/db1.connection";

dotenv.config();

async function main() {
  const migration = fs.readFileSync(
    path.resolve(process.cwd(), "database/migrations/db1/0003_mobile_app_integration.sql"),
    "utf8",
  );
  await Db1Connection.connect();
  const db = Db1Connection.getInstance();
  for (const statement of migration.split("--> statement-breakpoint")) {
    if (statement.trim()) await db.execute(statement);
  }
  await Db1Connection.disconnect();
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});

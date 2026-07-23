import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";
import dotenv from "dotenv";

dotenv.config();

async function checkMigrations() {
  await Db1Connection.connect();
  const db = Db1Connection.getInstance();
  const result = await db.execute("SELECT * FROM __drizzle_migrations");
  console.dir(result.rows, { maxArrayLength: null });
  await Db1Connection.disconnect();
  process.exit(0);
}
checkMigrations();

import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";
import dotenv from "dotenv";

dotenv.config();

async function checkTables() {
  await Db1Connection.connect();
  const db = Db1Connection.getInstance();
  const result = await db.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'");
  console.dir(result.rows.map(r => r.tablename), { maxArrayLength: null });
  await Db1Connection.disconnect();
  process.exit(0);
}
checkTables();

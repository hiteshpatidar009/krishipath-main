import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";
import dotenv from "dotenv";

dotenv.config();

async function checkSchema() {
  await Db1Connection.connect();
  const db = Db1Connection.getInstance();
  try {
    const res = await db.execute(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'market_sources';
    `);
    console.log("SCHEMA:", res.rows);
  } catch (e: any) {
    console.log("ERROR:", e.message);
  }
  
  await Db1Connection.disconnect();
  process.exit(0);
}
checkSchema();

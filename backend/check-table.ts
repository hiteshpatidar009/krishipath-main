import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";
import dotenv from "dotenv";

dotenv.config();

async function checkTable() {
  await Db1Connection.connect();
  const db = Db1Connection.getInstance();
  try {
    const res = await db.execute(`SELECT * FROM "market_sources" LIMIT 1`);
    console.log("SUCCESS:", res.rows);
  } catch (e: any) {
    console.log("ERROR:", e.message);
  }
  
  await Db1Connection.disconnect();
  process.exit(0);
}
checkTable();

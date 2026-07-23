import "dotenv/config";
import { sql } from "drizzle-orm";
import { Db1Connection } from "../src/infrastructure/database/postgres/connections/db1.connection";

const tables = [
  "mandis",
  "official_mandi_prices",
  "products",
  "product_variants",
  "mandi_products",
  "mandi_trader_assignments",
  "trader_mandi_prices",
  "market_insights",
  "content_schemes",
  "content_predictions",
  "content_polls",
  "content_creators",
  "content_shorts",
] as const;

async function main() {
  await Db1Connection.connect();
  const db = Db1Connection.getInstance();

  for (const table of tables) {
    const columns = await db.execute(sql`
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_schema = 'public' and table_name = ${table}
      order by ordinal_position
    `);
    const count = await db.execute(sql.raw(`select count(*)::int as count from "${table}"`));
    console.log(JSON.stringify({
      table,
      count: count.rows[0]?.count,
      columns: columns.rows,
    }));
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Db1Connection.disconnect();
  });

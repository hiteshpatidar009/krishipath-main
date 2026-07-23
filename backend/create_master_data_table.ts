import { sql } from "drizzle-orm";
import { Db1Connection } from "./src/infrastructure/database/postgres/connections/db1.connection";

async function run() {
  const db = Db1Connection.getInstance();
  console.log("Creating master_data_items table...");
  
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS master_data_items (
      id uuid PRIMARY KEY,
      type varchar(40) NOT NULL,
      name varchar NOT NULL,
      code varchar(40) NOT NULL,
      description text,
      status varchar(20) NOT NULL DEFAULT 'ACTIVE',
      created_at timestamp NOT NULL DEFAULT NOW(),
      updated_at timestamp NOT NULL DEFAULT NOW()
    );
  `));
  
  await db.execute(sql.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS master_data_items_type_code_unique ON master_data_items (type, code);
  `));
  
  console.log("Table created successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error creating table:", err);
  process.exit(1);
});

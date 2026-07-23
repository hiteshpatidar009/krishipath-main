import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

async function addAutomationColumn() {
  try {
    const connectionString = process.env.DB_URL || process.env.POSTGRES_URI;
    const client = postgres(connectionString);
    const db = drizzle(client);

    console.log("Adding is_automation_enabled column...");
    try {
        await client`
          ALTER TABLE market_source_parser_profiles 
          ADD COLUMN is_automation_enabled BOOLEAN DEFAULT false;
        `;
        console.log("Column added successfully.");
    } catch (e) {
        if (e.message.includes("already exists")) {
            console.log("Column already exists.");
        } else {
            console.error(e);
        }
    }
    
    await client.end();
  } catch (err) {
    console.error('Error adding column', err);
  }
}

addAutomationColumn();

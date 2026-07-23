import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./src/infrastructure/config/env";

async function addAutomationColumn() {
  try {
    const client = postgres(env.DB1_URI, { ssl: "require" });
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

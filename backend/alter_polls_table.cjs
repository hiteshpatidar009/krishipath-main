const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    host: process.env._DB_HOST_ONE || process.env.DB_HOST_ONE || 'localhost',
    port: process.env._DB_PORT_ONE || process.env.DB_PORT_ONE || 5432,
    user: process.env._DB_USER_ONE || process.env.DB_USER_ONE || 'postgres',
    password: process.env._DB_PASSWORD_ONE || process.env.DB_PASSWORD_ONE || 'postgres',
    database: process.env._DB_NAME_ONE || process.env.DB_NAME_ONE || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB1");

    await client.query(`
      ALTER TABLE content_polls ADD COLUMN IF NOT EXISTS target_districts jsonb;
    `);
    console.log("Table altered successfully");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await client.end();
  }
}

run();

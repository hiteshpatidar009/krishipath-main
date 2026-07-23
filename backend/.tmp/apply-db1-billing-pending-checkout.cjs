const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Client } = require("pg");

const connectionString = process.env._DB_URL_ONE;
const clientConfig = connectionString
  ? { connectionString }
  : {
      host: process.env._DB_HOST_ONE,
      port: Number(process.env._DB_PORT_ONE || 5432),
      database: process.env._DB_NAME_ONE,
      user: process.env._DB_USER_ONE,
      password: process.env._DB_PASSWORD_ONE,
    };

if (String(process.env._DB_SSL_ONE).toLowerCase() === "true") {
  clientConfig.ssl = { rejectUnauthorized: false };
}

const statements = [
  `ALTER TABLE IF EXISTS billing_invoices DROP CONSTRAINT IF EXISTS billing_invoices_company_id_companies_id_fk`,
  `ALTER TABLE IF EXISTS billing_invoices ALTER COLUMN company_id DROP NOT NULL`,
  `ALTER TABLE IF EXISTS billing_payments ALTER COLUMN company_id DROP NOT NULL`,
  `ALTER TABLE IF EXISTS billing_subscription_events ALTER COLUMN company_id DROP NOT NULL`,
];

async function main() {
  const client = new Client(clientConfig);
  await client.connect();
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log("DB1 billing pending-checkout patch applied");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  host: process.env._DB_HOST_ONE,
  port: Number(process.env._DB_PORT_ONE || 5432),
  user: process.env._DB_USER_ONE,
  password: process.env._DB_PASSWORD_ONE,
  database: process.env._DB_NAME_ONE,
  ssl: { rejectUnauthorized: false }
});
client.connect().then(() =>
  client.query("SELECT column_name FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position")
).then(r => {
  console.log('products columns:', r.rows.map(r => r.column_name).join(', '));
  // Also run ALTER to add missing columns
  return client.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;
  `);
}).then(() => {
  console.log('ALTER TABLE done (columns added if missing)');
  client.end();
}).catch(e => { console.error(e.message); client.end(); });

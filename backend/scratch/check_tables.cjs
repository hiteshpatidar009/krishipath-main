const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({
    host: process.env._DB_HOST_TWO,
    port: parseInt(process.env._DB_PORT_TWO || '5432'),
    database: process.env._DB_NAME_TWO,
    user: process.env._DB_USER_TWO,
    password: process.env._DB_PASSWORD_TWO,
    ssl: process.env._DB_SSL_TWO === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to DB2.');
    
    // Check if stock_take_plans table exists
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%stock_take%'
    `);
    console.log('Stock take tables found in public schema:');
    console.log(tablesRes.rows);

    // Let's check if the user has permission to create tables or what schema we are on
    const schemaRes = await client.query("SELECT current_schema(), current_user");
    console.log('Current schema and user:', schemaRes.rows[0]);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

test();

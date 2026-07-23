const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({
    host: process.env._DB_HOST_ONE,
    port: parseInt(process.env._DB_PORT_ONE || '5432'),
    database: process.env._DB_NAME_ONE,
    user: process.env._DB_USER_ONE,
    password: process.env._DB_PASSWORD_ONE,
    ssl: process.env._DB_SSL_ONE === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to DB1.');
    
    // Query users and MFA settings
    const users = await client.query('SELECT id, email, mfa_enabled, is_active FROM users LIMIT 10');
    console.log('Users:');
    console.log(users.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

test();

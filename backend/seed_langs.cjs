require('dotenv').config();
const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const pool = new Pool({
  host: process.env._DB_HOST_ONE,
  port: process.env._DB_PORT_ONE,
  database: process.env._DB_NAME_ONE,
  user: process.env._DB_USER_ONE,
  password: process.env._DB_PASSWORD_ONE,
  ssl: { rejectUnauthorized: false }
});

const values = [
  `('${randomUUID()}', 'te', 'Telugu', 'తెలుగు', true, false)`
].join(', ');

pool.query(`INSERT INTO languages (id, code, name, native_name, is_active, is_default) VALUES ${values} ON CONFLICT DO NOTHING`, (err, res) => {
  console.log(err || 'Telugu Language seeded');
  pool.end();
});

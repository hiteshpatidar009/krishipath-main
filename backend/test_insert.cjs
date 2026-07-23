require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env._DB_HOST_ONE,
  port: process.env._DB_PORT_ONE,
  database: process.env._DB_NAME_ONE,
  user: process.env._DB_USER_ONE,
  password: process.env._DB_PASSWORD_ONE,
  ssl: { rejectUnauthorized: false }
});

pool.query("INSERT INTO mandis (id, code, slug, state_id, district_id, name, status, currency, default_unit) VALUES ('b1fb0f52-5a41-477d-94bb-e3c15d78a87b', 'MANDI_123456', 'mandi-123456', '6a5d2ee7-eebe-4c70-84a3-b882a2840869', '96e562cb-94db-42f1-bfe1-7a8a1d917ad2', 'Test Mandi', 'ACTIVE', 'INR', 'QUINTAL')", (err, res) => {
  if (err) {
    console.error('ERROR ON MANDI INSERT:', err);
  } else {
    console.log('Mandi inserted successfully');
  }
  pool.end();
});

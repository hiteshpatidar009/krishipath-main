require('dotenv').config();
const { Client } = require('pg');

const c = new Client(process.env._DB_HOST_ONE ? {
  host: process.env._DB_HOST_ONE, 
  port: process.env._DB_PORT_ONE, 
  user: process.env._DB_USER_ONE, 
  password: process.env._DB_PASSWORD_ONE, 
  database: process.env._DB_NAME_ONE, 
  ssl: {rejectUnauthorized: false}
} : 'postgres://krishipathsql_user:VwBNJQuGSbO3L509wJvvr0jKPdqXGQVB@dpg-d999mqm7r5hc73b0bh0g-a.singapore-postgres.render.com:5432/krishipathsql?sslmode=require');

c.connect()
  .then(()=>c.query(`
    ALTER TABLE market_source_parser_profiles 
    ADD COLUMN IF NOT EXISTS message_template VARCHAR,
    ADD COLUMN IF NOT EXISTS default_unit VARCHAR DEFAULT 'QUINTAL',
    ADD COLUMN IF NOT EXISTS supported_crops JSONB,
    ADD COLUMN IF NOT EXISTS grade_mapping JSONB
  `))
  .then(()=>console.log('Columns added'))
  .catch(e=>console.error(e))
  .finally(()=>c.end());

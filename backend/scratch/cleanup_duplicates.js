import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Projects/flutter_projects/ROYAL/RSBC/rsbc/backend/.env') });

const pool = new pg.Pool({
  host: process.env._DB_HOST_ONE || process.env.DB_HOST_ONE,
  port: parseInt(process.env._DB_PORT_ONE || process.env.DB_PORT_ONE || '5432'),
  user: process.env._DB_USER_ONE || process.env.DB_USER_ONE,
  password: process.env._DB_PASSWORD_ONE || process.env.DB_PASSWORD_ONE,
  database: process.env._DB_NAME_ONE || process.env.DB_NAME_ONE || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const client = await pool.connect();
    console.log("Connected to DB1. Deleting duplicate organization '780ee1cd-ab85-4fdc-b22c-978cf785746d'...");
    
    const res = await client.query("DELETE FROM organizations WHERE id = '780ee1cd-ab85-4fdc-b22c-978cf785746d';");
    console.log(`Deleted rows: ${res.rowCount}`);
    
    client.release();
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await pool.end();
  }
}

run();

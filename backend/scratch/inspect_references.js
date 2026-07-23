import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Projects/flutter_projects/ROYAL/RSBC/rsbc/backend/.env') });

const pool2 = new pg.Pool({
  host: process.env._DB_HOST_TWO || process.env.DB_HOST_TWO,
  port: parseInt(process.env._DB_PORT_TWO || process.env.DB_PORT_TWO || '5432'),
  user: process.env._DB_USER_TWO || process.env.DB_USER_TWO,
  password: process.env._DB_PASSWORD_TWO || process.env.DB_PASSWORD_TWO,
  database: process.env._DB_NAME_TWO || process.env.DB_NAME_TWO || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const client2 = await pool2.connect();
    const ids = ['51430021-3633-48f6-ac03-dbad8836a79b', '780ee1cd-ab85-4fdc-b22c-978cf785746d'];
    
    // Find all columns named 'organization_id' in DB2
    const columnsRes = await client2.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'organization_id' OR column_name = 'source_organization_id' OR column_name = 'destination_organization_id';
    `);
    
    for (const id of ids) {
      console.log(`\n--- Inspecting DB2 references for ID: ${id} ---`);
      for (const row of columnsRes.rows) {
        try {
          const checkRes = await client2.query(`
            SELECT COUNT(*) as cnt FROM "${row.table_name}" WHERE "${row.column_name}" = $1
          `, [id]);
          if (parseInt(checkRes.rows[0].cnt) > 0) {
            console.log(`Table: ${row.table_name}.${row.column_name} -> count: ${checkRes.rows[0].cnt} 🚨`);
          } else {
            console.log(`Table: ${row.table_name}.${row.column_name} -> count: 0`);
          }
        } catch (err) {
          // Some table might be in different schema or view, ignore
        }
      }
    }
    
    client2.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool2.end();
  }
}

run();

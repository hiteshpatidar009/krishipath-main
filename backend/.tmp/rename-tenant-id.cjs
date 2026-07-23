const { Pool } = require('pg');
const p = new Pool({
  host: 'dpg-d89ulctckfvc7391ar80-a.singapore-postgres.render.com',
  port: 5432,
  database: 'rsbc_db_2',
  user: 'rsbc_2_user',
  password: 'g80wtGzWnHrDnnPiaCJPBSMd1zLqiEa6',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  // Get all tables that still have tenant_id
  const res = await p.query(
    "SELECT table_name FROM information_schema.columns WHERE column_name='tenant_id' AND table_schema='public' ORDER BY table_name"
  );
  const tables = res.rows.map(r => r.table_name);
  console.log(`Found ${tables.length} tables with tenant_id:`, tables.join(', '));

  for (const t of tables) {
    try {
      await p.query(`ALTER TABLE "${t}" RENAME COLUMN tenant_id TO company_id`);
      console.log(`OK: ${t}`);
    } catch (e) {
      console.log(`FAIL: ${t}: ${e.message}`);
    }
  }

  const check = await p.query(
    "SELECT table_name FROM information_schema.columns WHERE column_name='tenant_id' AND table_schema='public'"
  );
  console.log(`\nDone. Remaining tenant_id tables: ${check.rows.length === 0 ? 'NONE' : check.rows.map(r => r.table_name).join(', ')}`);
  await p.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

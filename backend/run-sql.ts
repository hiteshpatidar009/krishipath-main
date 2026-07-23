import fs from 'fs';
import path from 'path';
import { Db1Connection } from './src/infrastructure/database/postgres/connections/db1.connection';
import dotenv from 'dotenv';

dotenv.config();

async function runSql() {
  const migrationFile = process.argv[2] || '0002_new_jetstream.sql';
  if (path.basename(migrationFile) !== migrationFile || !/^\d{4}_[a-z0-9_]+\.sql$/i.test(migrationFile)) {
    throw new Error('Migration filename must be a db1 SQL basename, for example 0010_complete_mandi_flows.sql');
  }
  const sqlContent = fs.readFileSync(path.join(process.cwd(), 'database/migrations/db1', migrationFile), 'utf-8');
  const statements = sqlContent.split('--> statement-breakpoint');

  await Db1Connection.connect();
  const db = Db1Connection.getInstance();

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed) {
      try {
        await db.execute(trimmed);
        console.log("Executed statement successfully");
      } catch (e: any) {
        // Ignore "already exists" errors to be idempotent
        if (e.code === '42P07' || e.code === '42701') {
          console.log("Skipped (already exists): ", e.message);
        } else {
          throw e;
        }
      }
    }
  }

  await Db1Connection.disconnect();
  process.exit(0);
}

runSql();

import { MandiAdminRepository } from './src/modules/mandi/repositories/mandi-admin.repository';
import { Db1Connection } from './src/infrastructure/database/postgres/connections/db1.connection';

async function test() {
  console.log("Connecting to DB...");
  await Db1Connection.connect();
  const repo = new MandiAdminRepository();
  console.log("Querying...");
  try {
    const res = await repo.findAllPaginated({ page: 1, limit: 10 });
    console.log("Result:", res);
  } catch(e) {
    console.error("Query Error:", e);
  }
  process.exit(0);
}
test();

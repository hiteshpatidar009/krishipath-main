import 'dotenv/config';
import { Db1Connection } from './src/infrastructure/database/postgres/connections/db1.connection';
import { MandiAdminRepository } from './src/modules/mandi/repositories/mandi-admin.repository';

(async () => {
  try {
    const repo = new MandiAdminRepository();
    const result = await repo.findAllPaginated({
      page: 1, limit: 20
    });
    console.log('Success:', result.mandis.length);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
})();

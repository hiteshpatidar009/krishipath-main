import { databaseManager, Db1Connection } from "./infrastructure/database/index.js";
import { companiesTable } from "./infrastructure/database/postgres/schemas/db1/all.schema.js";
async function run() {
    await databaseManager.connectAll();
    const db = Db1Connection.getInstance();
    const companies = await db.select().from(companiesTable).limit(5);
    console.log("Companies:", companies);
    await databaseManager.disconnectAll();
    process.exit(0);
}
run();

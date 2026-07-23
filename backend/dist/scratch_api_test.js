import { Db2Connection } from "./infrastructure/database/postgres/connections/db2.connection";
import { sql } from "drizzle-orm";
import { PostgresStockCountingRepository } from "./modules/stock-counting-reconciliation/infrastructure/postgres-stock-counting.repository";
async function run() {
    const db = Db2Connection.getInstance();
    try {
        const plans = await db.execute(sql `SELECT * FROM stock_take_plans ORDER BY created_at DESC LIMIT 1`);
        const list = Array.isArray(plans) ? plans : plans.rows ?? [];
        if (list.length === 0) {
            console.log("No plans found");
            return;
        }
        const plan = list[0];
        console.log("Found plan ID:", plan.id, "Company ID:", plan.company_id);
        const repo = new PostgresStockCountingRepository();
        const result = await repo.getStockTakePlan(plan.id, plan.company_id);
        console.log("Mapped Result:", JSON.stringify(result, null, 2));
    }
    catch (err) {
        console.error("Error:", err);
    }
    finally {
        process.exit(0);
    }
}
run();

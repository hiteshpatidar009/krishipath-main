import { Db2Connection } from "./infrastructure/database/postgres/connections/db2.connection";
import { sql } from "drizzle-orm";
async function run() {
    const db = Db2Connection.getInstance();
    try {
        const rows = await db.execute(sql `SELECT * FROM stock_take_plans ORDER BY created_at DESC LIMIT 5`);
        const list = Array.isArray(rows) ? rows : rows.rows ?? [];
        console.log("Found plans:", list.length);
        if (list.length > 0) {
            const p = list[0];
            console.log("First plan details:");
            console.log("ID:", p.id);
            console.log("plan_code:", p.plan_code);
            console.log("plan_name:", p.plan_name);
            console.log("status:", p.status);
            console.log("total_bins:", p.total_bins);
            console.log("counted_bins:", p.counted_bins);
            console.log("variance_value:", p.variance_value);
            console.log("total_items_value:", p.total_items_value);
        }
    }
    catch (err) {
        console.error("DB Error:", err);
    }
    finally {
        process.exit(0);
    }
}
run();

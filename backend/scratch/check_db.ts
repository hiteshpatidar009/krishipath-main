import { Db1Connection } from "../src/infrastructure/database/postgres/connections/db1.connection";
import { SubscriptionLimitService } from "../src/modules/subscription/application/subscription-limit.service";
import { sql } from "drizzle-orm";

async function main() {
  const db = Db1Connection.getInstance();
  try {
    const users = await db.execute(sql`SELECT id, email FROM users`);
    console.log("PLAN LIMITS FOR EACH USER:");
    for (const user of users.rows as any[]) {
      const limits = await SubscriptionLimitService.getPlanLimits(user.id);
      console.log(`User: ${user.email} (${user.id})`);
      console.log(`Plan Limits:`, JSON.stringify(limits, null, 2));
      console.log("-----------------------------------------");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();

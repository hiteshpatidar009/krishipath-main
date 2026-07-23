import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { Db1Connection } from "../src/infrastructure/database/postgres/connections/db1.connection";
import {
  farmersTable,
  sessionsTable,
  usersTable,
} from "../src/infrastructure/database/postgres/schemas/db1/all.schema";
import { TokenService } from "../src/modules/auth/services/token.service";

async function main(): Promise<void> {
  await Db1Connection.connect();
  let temporarySessionId: string | null = null;
  try {
    const db = Db1Connection.getInstance();
    const [row] = await db
      .select({
        userId: usersTable.id,
        profileStatus: usersTable.profileStatus,
      })
      .from(usersTable)
      .where(eq(usersTable.userType, "farmer"))
      .limit(1);

    if (!row?.userId) throw new Error("No farmer profile available for integration test");

    temporarySessionId = randomUUID();
    await db.insert(sessionsTable).values({
      id: temporarySessionId,
      userId: row.userId,
      loginMethod: "home_integration_check",
      loginProvider: "local",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    const token = new TokenService().signAccess({
      sub: row.userId,
      sessionId: temporarySessionId,
      accessLevel: "full",
      authType: "iam",
      userType: "farmer",
      profileStatus: row.profileStatus === "COMPLETE" ? "COMPLETED" : "INCOMPLETE",
    });

    for (const path of [
      "/farmer/profile",
      "/farmer/calendar?year=2026&month=7",
      "/farmer/tasks",
    ]) {
      const response = await fetch(`http://127.0.0.1:59231/api/v1${path}`, {
        headers: { Authorization: `Bearer ${token}`, "Accept-Language": "hi" },
      });
      const payload = await response.json() as any;
      const summary = path.includes("calendar")
        ? { year: payload?.data?.year, month: payload?.data?.month, events: payload?.data?.events?.length }
        : path.includes("tasks")
          ? { tasks: payload?.data?.length }
          : { profileId: payload?.data?.id, preferredMandiId: payload?.data?.preferredMandiId };
      console.log(JSON.stringify({
        path,
        status: response.status,
        success: payload?.success,
        dataType: payload?.data === null ? "null" : typeof payload?.data,
        dataKeys: payload?.data && !Array.isArray(payload.data) ? Object.keys(payload.data) : undefined,
        summary,
      }));
    }
    const profiles = await db.select({ id: farmersTable.id, userId: farmersTable.userId }).from(farmersTable);
    console.log(JSON.stringify({ farmerProfiles: profiles.length }));
  } finally {
    if (temporarySessionId) {
      await Db1Connection.getInstance()
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, temporarySessionId));
    }
    await Db1Connection.disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

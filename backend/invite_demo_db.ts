import { db } from "./src/infrastructure/database/postgres/schemas/db1/index";
import { invitationsTable, rolesTable } from "./src/infrastructure/database/postgres/schemas/db1/all.schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function run() {
  const adminRole = await db.select().from(rolesTable).where(eq(rolesTable.name, "Admin")).limit(1);
  if (!adminRole.length) {
    console.log("No Admin role found");
    return;
  }
  const role = adminRole[0];

  await db.insert(invitationsTable).values({
    id: randomUUID(),
    companyId: role.companyId,
    email: "hiteshpatdar009@gmail.com",
    firstName: "Hitesh",
    lastName: "Patidar",
    roleId: role.id,
    warehouseAccess: { all: true },
    token: randomUUID(),
    invitedBy: "system",
    status: "pending",
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Invitation inserted directly into DB!");
}

run().then(() => process.exit(0)).catch(console.error);

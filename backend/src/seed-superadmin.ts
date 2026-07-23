import { randomUUID } from "crypto";
import { databaseManager, Db1Connection } from "./infrastructure/database";
import { PassService } from "./modules/auth/services/pass.service";
import { usersTable, rolesTable, userRolesTable, companiesTable } from "./infrastructure/database/postgres/schemas/db1";
import { eq, and } from "drizzle-orm";

async function run() {
  console.log("Connecting to databases...");
  await databaseManager.connectAll();

  const db = Db1Connection.getInstance();
  const passService = new PassService();

  const email = "superadmin@krishipath.com";
  const password = "Password123!";
  
  console.log(`Checking if user ${email} exists...`);
  const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  
  let userId = "";

  if (existingUser.length > 0) {
    console.log("Super admin user already exists. Updating password...");
    userId = existingUser[0].id;
    const { hash, salt } = await passService.hash(password);
    await db.update(usersTable).set({ passwordHash: hash, passwordSalt: salt, isEmailVerified: true }).where(eq(usersTable.id, userId));
  } else {
    console.log("Creating new super admin user...");
    userId = randomUUID();
    const { hash, salt } = await passService.hash(password);
    
    await db.insert(usersTable).values({
      id: userId,
      email,
      firstName: "System",
      lastName: "SuperAdmin",
      passwordHash: hash,
      passwordSalt: salt,
      status: "active",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Find or create role
  console.log("Checking for Platform Super Admin role...");
  let roleId = "";
  const roles = await db.select().from(rolesTable).where(eq(rolesTable.name, "Platform Super Admin")).limit(1);
  
  if (roles.length > 0) {
    roleId = roles[0].id;
  } else {
    console.log("Creating Platform Super Admin role...");
    roleId = randomUUID();
    await db.insert(rolesTable).values({
      id: roleId,
      name: "Platform Super Admin",
      description: "Highest level of access",
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log("Checking for default System Company...");
  let companyId = "";
  const companies = await db.select().from(companiesTable).limit(1);
  if (companies.length > 0) {
    companyId = companies[0].id;
  } else {
    console.log("Creating System Company...");
    companyId = randomUUID();
    await db.insert(companiesTable).values({
      id: companyId,
      name: "KrishiPath System",
      slug: "krishipath-system",
      code: "SYS",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Assign role
  const userRoles = await db.select().from(userRolesTable).where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.roleId, roleId))).limit(1);
  if (userRoles.length === 0) {
    console.log("Assigning role to user...");
    await db.insert(userRolesTable).values({
      id: randomUUID(),
      userId,
      roleId,
      companyId, // Assign to the system company
      assignedAt: new Date()
    });
  } else if (!userRoles[0].companyId) {
    console.log("Updating role with company ID...");
    await db.update(userRolesTable).set({ companyId }).where(eq(userRolesTable.id, userRoles[0].id));
  } else {
    console.log("User already has the role assigned.");
  }

  console.log(`\n✅ Success! Super Admin created or updated.`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  await databaseManager.disconnectAll();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Error seeding super admin:", err);
  await databaseManager.disconnectAll();
  process.exit(1);
});

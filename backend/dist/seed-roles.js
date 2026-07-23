import { randomUUID } from "crypto";
import { databaseManager, Db1Connection } from "./infrastructure/database";
import { rolesTable, companiesTable } from "./infrastructure/database/postgres/schemas/db1";
import { eq } from "drizzle-orm";
async function run() {
    console.log("Connecting to databases...");
    await databaseManager.connectAll();
    const db = Db1Connection.getInstance();
    // Find KrishiPath company
    const companies = await db.select().from(companiesTable).limit(1);
    if (companies.length === 0) {
        console.error("No companies found. Run company seed first.");
        process.exit(1);
    }
    const companyId = companies[0].id;
    console.log(`Using company: ${companies[0].name} (${companyId})`);
    const rolesToCreate = [
        { name: "Mandi Administrator", description: "Full access to Mandi management" },
        { name: "Inventory Manager", description: "Access to inventory and stock" },
        { name: "Support Agent", description: "Customer support access" },
        { name: "Reporting Analyst", description: "Read-only access to analytics and reports" },
        { name: "Field Agent", description: "Access to farmer onboarding and basic operations" }
    ];
    for (const role of rolesToCreate) {
        const existing = await db.select().from(rolesTable).where(eq(rolesTable.name, role.name)).limit(1);
        if (existing.length > 0) {
            console.log(`Role '${role.name}' already exists.`);
        }
        else {
            console.log(`Creating role '${role.name}'...`);
            const roleId = randomUUID();
            await db.insert(rolesTable).values({
                id: roleId,
                companyId,
                name: role.name,
                description: role.description,
                isSystemRole: false,
                isDefaultRole: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Created role '${role.name}' (${roleId})`);
        }
    }
    console.log("Done seeding roles!");
    process.exit(0);
}
run().catch(console.error);

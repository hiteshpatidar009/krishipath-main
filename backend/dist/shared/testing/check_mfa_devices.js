import { Db1Connection } from "../../infrastructure/database/postgres/connections/db1.connection";
import { mfaDevicesTable, usersTable } from "../../infrastructure/database/postgres/schemas/db1/all.schema";
import { SecService } from "../../modules/auth/services/sec.service";
import { eq } from "drizzle-orm";
async function main() {
    try {
        const db = Db1Connection.getInstance();
        const secService = new SecService();
        console.log("Fetching MFA devices...");
        const devices = await db.select().from(mfaDevicesTable);
        console.log(`Found ${devices.length} MFA devices.`);
        for (const device of devices) {
            console.log(`\nDevice ID: ${device.id}`);
            console.log(`User ID: ${device.userId}`);
            console.log(`MFA Type: ${device.mfaType}`);
            console.log(`Secret Hash length: ${device.secretHash?.length}`);
            const user = await db.select().from(usersTable).where(eq(usersTable.id, device.userId)).limit(1);
            if (user.length > 0) {
                console.log(`User Email: ${user[0].email}`);
            }
            if (device.secretHash) {
                try {
                    const decrypted = secService.decrypt(device.secretHash);
                    console.log("Decryption success!");
                }
                catch (e) {
                    console.log(`Decryption FAILED: ${e.message}`);
                }
            }
            else {
                console.log("No secret hash on device.");
            }
        }
    }
    catch (err) {
        console.error("Error in check:", err);
    }
    finally {
        process.exit(0);
    }
}
main();

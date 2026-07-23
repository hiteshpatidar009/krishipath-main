import { databaseManager, Db1Connection } from "./src/infrastructure/database";
import { invitationsTable } from "./src/infrastructure/database/postgres/schemas/db1";
import { eq } from "drizzle-orm";
import { UserService } from "./src/modules/user/application/user.service";
import { UserRepository } from "./src/modules/user/infrastructure/user.repository";

async function acceptInvite(email: string, password?: string) {
  await databaseManager.connectAll();
  const db = Db1Connection.getInstance();
  
  // Find pending invitation
  const invites = await db.select().from(invitationsTable).where(eq(invitationsTable.email, email)).limit(1);
  if (invites.length === 0) {
    console.error(`No invitation found for email: ${email}`);
    process.exit(1);
  }
  
  const invite = invites[0];
  if (invite.status !== "pending") {
    console.error(`Invitation is not pending (status: ${invite.status})`);
    process.exit(1);
  }

  console.log(`Accepting invitation for ${email}...`);
  const userService = new UserService(new UserRepository(db));
  
  try {
    const result = await userService.acceptInvitation(invite.token, password);
    console.log(`✅ Success! Invitation accepted. User ID: ${result.userId}`);
    console.log(`You can now login with email: ${email} and the password you provided.`);
  } catch (error: any) {
    console.error("❌ Failed to accept invitation:", error.message || error);
  }
  
  process.exit(0);
}

// Usage: npx tsx accept_invite.ts <email> <new_password>
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: npx tsx accept_invite.ts <email> <new_password>");
  process.exit(1);
}

acceptInvite(email, password);

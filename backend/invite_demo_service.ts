import { NestFactory } from "@nestjs/core";
import { UserModule } from "./src/modules/user/user.module";
import { UserService } from "./src/modules/user/application/user.service";
import { db } from "./src/infrastructure/database/postgres/schemas/db1/index";
import { rolesTable } from "./src/infrastructure/database/postgres/schemas/db1/all.schema";
import { eq } from "drizzle-orm";
import { AppModule } from "./src/app.module";

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const adminRole = await db.select().from(rolesTable).where(eq(rolesTable.name, "Admin")).limit(1);
  if (!adminRole.length) {
    console.log("No Admin role found");
    return;
  }
  const role = adminRole[0];

  console.log("Creating invitation and sending email via Brevo...");
  
  await userService.invite({
    companyId: role.companyId as string,
    actorId: "system",
    email: "hiteshpatdar009@gmail.com",
    firstName: "Hitesh",
    lastName: "Patidar",
    roleId: role.id,
    warehouseAccess: { all: true }
  });

  console.log("Invitation sent successfully!");
  await app.close();
}

run().catch(console.error);

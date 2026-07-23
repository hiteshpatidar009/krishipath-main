import { NestFactory } from "@nestjs/core";
// This is a standalone script to insert demo data
import { DatabaseService } from "./src/infrastructure/database/database.service";
import { UserModule } from "./src/modules/user/user.module";
import { UserService } from "./src/modules/user/application/user.service";
import { CompanyService } from "./src/modules/company/services/company.service";
import { RoleService } from "./src/modules/auth/services/role.service";

async function run() {
  // Just use direct fetch to our own API
  const response = await fetch("http://localhost:59231/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "superadmin@krishipath.com", // Assuming this is the super admin email
      password: "password123", // Assuming this is the super admin password
      isRoot: true,
      captchaToken: "dev-bypass"
    })
  });
  
  const authData = await response.json();
  if (!authData.success) {
    console.log("Login failed", authData);
    return;
  }
  
  const token = authData.data.accessToken;
  
  // Get roles
  const rolesResp = await fetch("http://localhost:59231/api/v1/auth/roles", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const rolesData = await rolesResp.json();
  const roleId = rolesData.data.find(r => r.name.toLowerCase().includes("admin"))?.id;

  if (!roleId) {
    console.log("No admin role found");
    return;
  }

  // Invite
  const inviteResp = await fetch("http://localhost:59231/api/v1/iam/users", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      email: "hiteshpatidar009@gmail.com",
      firstName: "Hitesh",
      lastName: "Patidar",
      roleId: roleId,
      warehouseAccess: { all: true }
    })
  });
  
  console.log("Invite Response:", await inviteResp.json());
}

run().catch(console.error);

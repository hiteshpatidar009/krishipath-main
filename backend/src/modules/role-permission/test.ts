import { join } from "path";

import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { RolePermissionModule } from "./module";

registerEnterpriseModuleTests({
  moduleName: "role-permission",
  moduleDir: join(process.cwd(), "src", "modules", "role-permission"),
  ModuleClass: RolePermissionModule,
  expectedRouteCount: 16,
  requiresAuth: true,
});

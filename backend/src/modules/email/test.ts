import { join } from "path";

import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { EmailModule } from "./module";

registerEnterpriseModuleTests({
  moduleName: "email",
  moduleDir: join(process.cwd(), "src", "modules", "email"),
  ModuleClass: EmailModule,
  expectedRouteCount: 1,
  requiresAuth: true,
});

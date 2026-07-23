import { join } from "path";

import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { ActivityLogModule } from "./module";

registerEnterpriseModuleTests({
  moduleName: "activity-log",
  moduleDir: join(process.cwd(), "src", "modules", "activity-log"),
  ModuleClass: ActivityLogModule,
  expectedRouteCount: 2,
  requiresAuth: true,
});

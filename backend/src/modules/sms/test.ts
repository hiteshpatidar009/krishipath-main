import { join } from "path";

import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { SmsModule } from "./module";

registerEnterpriseModuleTests({
  moduleName: "sms",
  moduleDir: join(process.cwd(), "src", "modules", "sms"),
  ModuleClass: SmsModule,
  expectedRouteCount: 1,
  requiresAuth: true,
});

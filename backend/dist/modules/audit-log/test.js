import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { AuditLogModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "audit-log",
    moduleDir: join(process.cwd(), "src", "modules", "audit-log"),
    ModuleClass: AuditLogModule,
    expectedRouteCount: 2,
    requiresAuth: true,
});

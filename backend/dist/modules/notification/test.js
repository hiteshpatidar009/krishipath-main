import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { NotificationModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "notification",
    moduleDir: join(process.cwd(), "src", "modules", "notification"),
    ModuleClass: NotificationModule,
    expectedRouteCount: 4,
    requiresAuth: true,
});

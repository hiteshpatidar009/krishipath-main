import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { PushNotificationModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "push-notification",
    moduleDir: join(process.cwd(), "src", "modules", "push-notification"),
    ModuleClass: PushNotificationModule,
    expectedRouteCount: 1,
    requiresAuth: true,
});

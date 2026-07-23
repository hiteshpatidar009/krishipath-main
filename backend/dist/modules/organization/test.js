import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { OrganizationModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "organization",
    moduleDir: join(process.cwd(), "src", "modules", "organization"),
    ModuleClass: OrganizationModule,
    expectedRouteCount: 9,
    requiresAuth: true,
});

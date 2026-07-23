import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { CompanyModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "company",
    moduleDir: join(process.cwd(), "src", "modules", "company"),
    ModuleClass: CompanyModule,
    expectedRouteCount: 9,
    requiresAuth: true,
});

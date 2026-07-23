import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { DocumentModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "document",
    moduleDir: join(process.cwd(), "src", "modules", "document"),
    ModuleClass: DocumentModule,
    expectedRouteCount: 3,
    requiresAuth: true,
});

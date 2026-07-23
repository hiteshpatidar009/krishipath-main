import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { FileStorageModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "file-storage",
    moduleDir: join(process.cwd(), "src", "modules", "file-storage"),
    ModuleClass: FileStorageModule,
    expectedRouteCount: 1,
    requiresAuth: true,
});

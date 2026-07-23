import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { PurchaseProcurementModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "purchase-procurement",
    moduleDir: join(process.cwd(), "src", "modules", "purchase-procurement"),
    ModuleClass: PurchaseProcurementModule,
    expectedRouteCount: 6,
    requiresAuth: true,
});

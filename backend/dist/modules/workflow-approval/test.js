import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { WorkflowApprovalModule } from "./module";
registerEnterpriseModuleTests({
    moduleName: "workflow-approval",
    moduleDir: join(process.cwd(), "src", "modules", "workflow-approval"),
    ModuleClass: WorkflowApprovalModule,
    expectedRouteCount: 7,
    requiresAuth: true,
});

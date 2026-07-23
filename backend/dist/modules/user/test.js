import { join } from "path";
import { describe, expect, it } from "vitest";
import { UserValidator } from "./presentation/user.validator";
import { UserModule } from "./module";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
describe("user module", () => {
    it("exposes router", () => {
        expect(new UserModule().getRouter()).toBeDefined();
    });
    it("validates invite payload", () => {
        expect(UserValidator.invite.parse({
            email: "ops@example.com",
            firstName: "Alex",
            lastName: "Smith",
            roleId: "da279328-76fa-4927-b8f4-6a84c6c062c3",
            warehouseAccess: { all: true },
        }).email).toBe("ops@example.com");
    });
    it("rejects invalid invite email", () => {
        expect(() => UserValidator.invite.parse({
            email: "bad",
            firstName: "Alex",
            lastName: "Smith",
            roleId: "da279328-76fa-4927-b8f4-6a84c6c062c3",
            warehouseAccess: { all: true },
        })).toThrow();
    });
});
registerEnterpriseModuleTests({
    moduleName: "user",
    moduleDir: join(process.cwd(), "src", "modules", "user"),
    ModuleClass: UserModule,
    expectedRouteCount: 23,
    requiresAuth: true,
});

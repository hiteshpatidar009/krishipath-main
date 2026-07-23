import { describe, expect, it } from "vitest";
import { ApiKeyModule } from "./module";
import { ApiKeyValidator } from "./presentation/api-key.validator";
describe("api-key module", () => {
    it("exposes router", () => {
        expect(new ApiKeyModule().getRouter()).toBeDefined();
    });
    it("validates scoped key creation", () => {
        const payload = ApiKeyValidator.create.parse({ keyName: "ERP Sync", scopes: ["inventory:read"] });
        expect(payload.scopes).toContain("inventory:read");
    });
    it("rejects empty scopes", () => {
        expect(() => ApiKeyValidator.create.parse({ keyName: "ERP Sync", scopes: [] })).toThrow();
    });
});

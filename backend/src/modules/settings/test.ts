import { describe, expect, it } from "vitest";
import { SettingsModule } from "./module";
import { SettingsValidator } from "./presentation/settings.validator";

describe("settings module", () => {
  it("exposes router", () => {
    expect(new SettingsModule().getRouter()).toBeDefined();
  });

  it("validates company settings", () => {
    expect(SettingsValidator.update.parse({ defaultCurrencyCode: "USD" }).defaultCurrencyCode).toBe("USD");
  });

  it("rejects invalid currency", () => {
    expect(() => SettingsValidator.update.parse({ defaultCurrencyCode: "US" })).toThrow();
  });
});

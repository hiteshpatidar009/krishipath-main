import { defineConfig } from "vitest/config";

process.env.NODE_ENV = "development";
process.env._ENV = process.env._ENV ?? "development";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/modules/**/test.ts",
      "src/**/*.test.ts",
      "src/**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "reports/coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/**/test.ts"],
    },
    restoreMocks: true,
  },
});

import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "reports/**",
      "src/**/*.test.ts",
      "src/**/*.spec.ts",
      "src/**/test.ts",
      "src/**/tests/**",
    ],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "unused-imports/no-unused-imports": "error",
      "import/no-cycle": "warn",
    },
  },
];

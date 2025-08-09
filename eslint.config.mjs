import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    // Specific configuration for .cjs files
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs", // Explicitly tell ESLint these are CommonJS modules
      globals: {
        ...globals.node, // Ensure Node.js globals
        module: "writable", // Define CommonJS specific globals
        exports: "writable",
        require: "readonly",
      },
    },
    // If typescript-eslint rules still cause issues in .cjs files after setting sourceType,
    // you might need to disable specific rules here. For example:
    // rules: {
    //   "@typescript-eslint/no-var-requires": "off", // If you were using require()
    // }
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
]);

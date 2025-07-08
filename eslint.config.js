// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const path = require('path');

// Import custom shared module rules
const sharedModuleRules = require(path.resolve(__dirname, "../eslint-rules/enforce-shared-modules.js"));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      "shared-modules": sharedModuleRules,
    },
    rules: {
      // Custom shared module rules
      "shared-modules/enforce-shared-imports": "error",
      "shared-modules/prefer-shared-constants": "warn", 
      "shared-modules/no-duplicate-shared-types": "error",
    },
  },
]);

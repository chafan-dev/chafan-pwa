import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

export default defineConfigWithVueTs(
  // Vue 3 recommended rules
  pluginVue.configs["flat/recommended"],

  // TypeScript strict rules
  vueTsConfigs.strict,

  // Global ignores
  {
    ignores: ["node_modules/**", "dist/**", "*.config.js", "*.config.ts"],
  },

  // Custom rule overrides
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // Vue rules
      "vue/no-unused-components": "warn",
      "vue/require-v-for-key": "error",
      "vue/no-use-v-if-with-v-for": "error",
    },
  },
);

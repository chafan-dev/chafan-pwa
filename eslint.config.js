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
  // Keep CI green on real bugs; demote migration-era noise to warn/off.
  {
    rules: {
      // TypeScript — strict config is noisy on this codebase mid-migration
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/unified-signatures": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-dynamic-delete": "warn",

      // Vue correctness (keep as errors)
      "vue/require-v-for-key": "error",
      "vue/no-use-v-if-with-v-for": "error",

      // Vue style / Vuetify compatibility
      "vue/no-unused-components": "warn",
      "vue/multi-word-component-names": "off",
      // Vuetify uses slot modifiers like v-slot:item.active
      "vue/valid-v-slot": "off",
      "vue/no-unused-vars": "warn",
      "vue/no-mutating-props": "warn",
      "vue/no-deprecated-v-on-native-modifier": "warn",
      "vue/no-side-effects-in-computed-properties": "warn",
      "vue/block-lang": "warn",

      // Rule referenced historically but plugin not installed
      "import/prefer-default-export": "off",

      // Prefer const is good but not worth failing CI mid-migration
      "prefer-const": "warn",
    },
  },
);

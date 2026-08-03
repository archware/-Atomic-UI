// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default tseslint.config(
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "no-unused-disable": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@angular-eslint/no-output-native": "warn",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      // `app` es el único prefijo canónico para componentes nuevos.
      "@angular-eslint/component-selector": [
        "error",
        {
          type: ["element", "attribute"],
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    // Excepción transitoria y cerrada para aliases incorporados antes de que
    // `app-*` se estableciera como prefijo canónico. El gate de selectores
    // exige que cada alias `prest-*` conserve el `app-*` equivalente primero.
    files: [
      "src/app/shared/ui/organisms/denomination-counter/denomination-counter.ts",
      "src/app/shared/ui/organisms/form-dialog/form-dialog.ts",
      "src/app/shared/ui/organisms/print-document-panel/print-document-panel.ts",
      "src/app/shared/ui/organisms/receipt-panel/receipt-panel.ts",
    ],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          type: ["element", "attribute"],
          prefix: ["app", "prest"],
          style: "kebab-case",
        },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "no-unused-disable": "off",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
    },
  }
);

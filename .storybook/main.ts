import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": {
    "name": "@storybook/angular",
    "options": {
      "builder": {
        "name": "@storybook/builder-webpack5",
        "options": {
          "lazyCompilation": true,
          "fsCache": true
        }
      }
    }
  },
  "core": {
    "disableTelemetry": true
  },
  "docs": {}
};
export default config;
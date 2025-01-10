import { DEFAULT_THEME } from '@cucumber/pretty-formatter';

export default {
  requireModule: ['ts-node/register', 'tsconfig-paths/register'],
  require: [
    'test-suites/features/step-definitions/**/*.ts',
    'test-suites/support/**/*.ts',
  ],
  paths: ['test-suites/features/**/*.feature'],
  format: ['@cucumber/pretty-formatter'],
  formatOptions: {
    PrettyFormatter: {
      ...DEFAULT_THEME,
      FeatureKeyword: ['magenta', 'bold'],
      ScenarioKeyword: ['red'],
    },
  },
  tags: 'not @ignore',
};

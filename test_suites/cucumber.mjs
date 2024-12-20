import PrettyFormatter, { DEFAULT_THEME } from '@cucumber/pretty-formatter'

export default {
  requireModule: ['ts-node/register'],
  //loader: ['ts-node/esm'],
  require: [
    'test_suites/features/step_definitions/**/*.ts',
    'test_suites/support/**/*.ts',
  ],
  paths: ['test_suites/features/**/*.feature'],
  format: ['@cucumber/pretty-formatter'],
  formatOptions: {
    PrettyFormatter: {...DEFAULT_THEME, FeatureKeyword: ["magenta", "bold"], ScenarioKeyword: ["red"]},
  },
  tags: 'not @ignore',
};

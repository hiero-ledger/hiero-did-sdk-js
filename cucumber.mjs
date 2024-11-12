export default {
  requireModule: ['ts-node/register'],
  require: [
    'test_suites/features/step_definitions/**/*.ts',
    'test_suites/support/**/*.ts'
  ],
  paths: ['test_suites/features/**/*.feature'],
  format: ['progress-bar'],
  formatOptions: {
    snippetInterface: 'synchronous'
  },
  tags: 'not @ignore',
};

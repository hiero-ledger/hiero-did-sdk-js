// cucumber.js
let common = [
  './test-poc/features/**/*.feature',                // Specify our feature files
  '--require-module ts-node/register',          // Load TypeScript module
  '--require ./test-poc/features/steps/**/*.ts',   // Load step definitions
  '--require ./test-poc/hooks.ts',
  '--format progress-bar',                      // Load custom formatter
  '--publish-quiet',
  `--format-options '{"snippetInterface": "synchronous"}'`
].join(' ');

module.exports = {
  default: common
};

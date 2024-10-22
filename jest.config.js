/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  testMatch: ['<rootDir>/**/?(*.)+(spec|test).[tj]s?(x)', '<rootDir>/**/*.feature'],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  rootDir: 'test-poc',
};
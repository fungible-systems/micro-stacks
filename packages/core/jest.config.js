const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc-node/jest', { sourcemap: 'inline', dynamicImport: true }],
  },
  testMatch: ['**/?(*.)+(test).(js|ts|tsx)'],
  collectCoverage: true,
  coverageReporters: ['html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  cacheDirectory: '<rootDir>/.jest-cache',
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
};

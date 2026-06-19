/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/app/**/*.ts", // Source files
    "!src/app/**/*.spec.ts", // Exclude test files
  ],
  coverageDirectory: "coverage", // Coverage output directory
  coverageReporters: ["html"],
  testPathIgnorePatterns: ['<rootDir>/cypress/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
};
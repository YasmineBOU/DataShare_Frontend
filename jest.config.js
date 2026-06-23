/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    "src/app/**/*.ts", // Source files
    "!src/app/**/*.spec.ts", // Exclude test files
    '!src/app/**/app.config.ts', // Exclude app.config.ts
    '!src/app/**/app.config.server.ts', // Exclude app.config.ts
    '!src/app/**/app.server.config.ts', // Exclude app.server.config.ts
    '!src/app/**/app.routes.ts', // Exclude app.routes.ts
    '!src/app/**/app.routes.server.ts', // Exclude app.routes.server.ts
    '!src/app/**/*.module.ts', // Exclude Angular module files
    '!**/node_modules/**',
  ],
  coverageDirectory: "coverage", // Coverage output directory
  coverageReporters: ["text", "lcov", "html"],
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
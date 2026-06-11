console.log('>>> setup-jest.ts is running');
const { setupZonelessTestEnv } = require('jest-preset-angular/setup-env/zoneless');

// Call setupZonelessTestEnv() only if not already initialized by the preset
const { getTestBed } = require('@angular/core/testing');
try {
  getTestBed().compiler; // Throws error if not initialized
} catch {
  setupZonelessTestEnv();
}
const fs = require('fs');

// Prepare the dates
const now = new Date();
const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

// Create the file objects
const validFile = {
  id: 1,
  filename: 'test-file.pdf',
  fileSize: '1024',
  fileToken: 'active-token-123',
  hasPassword: false,
  expirationDate: sevenDaysLater.toISOString()
};

const passwordProtectedFile = {
  ...validFile,
  hasPassword: true,
  filename: 'protected-file.txt',
  fileToken: 'protected-token-456',
  fileSize: '2048'
};

const expiredFile = {
  ...validFile,
  filename: 'expired-file.png',
  fileToken: 'expired-token-789',
  fileSize: '512',
  expirationDate: oneDayAgo.toISOString()
};

// Combine the files into a single fixture object
const filesFixture = {
  validFile,
  passwordProtectedFile,
  expiredFile
};

// Write the fixture to a JSON file
fs.writeFileSync(
  'cypress/fixtures/files.json',
  JSON.stringify(filesFixture, null, 2),
  'utf-8'
);

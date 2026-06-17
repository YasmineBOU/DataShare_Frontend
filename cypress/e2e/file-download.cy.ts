import files from '../fixtures/files.json';


const BASE_URL = Cypress.config('baseUrl');

function getDownloadUrl(fileToken: string | number): string {
  return `/files/download?fileToken=${fileToken}`;
}

describe('File Download page', () => {

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  describe('Valid file (no password)', () => {

    const validFile = files.validFile;

    beforeEach(() => {
      cy.intercept('GET', '/api/files/info*', {
        statusCode: 200,
        body: validFile
      }).as('getFileInfo');

      cy.visit(getDownloadUrl(validFile.fileToken), {timeout: 10000});
      cy.url({ timeout: 10000 }).should('include', '/');
    });
    
    it('should display file info', () => {
      cy.contains('h1', 'Télécharger un fichier').should('be.visible');
      cy.contains('h3', validFile.filename).should('be.visible');
      cy.contains('button', 'Télécharger').should('be.visible');
    });

    it('should not show password field', () => {
      cy.get('input[id="password"]').should('not.exist');
    });

    it('should show expiration message', () => {
      cy.contains('Ce fichier expirera').should('be.visible');
    });
  });
  
  describe('Password protected file', () => {
    const passwordProtectedFile = files.passwordProtectedFile;

    beforeEach(() => {
      cy.intercept('GET', '/api/files/info*', {
        statusCode: 200,
        body: passwordProtectedFile
      }).as('getFileInfo');

      cy.visit(getDownloadUrl(passwordProtectedFile.fileToken));
      cy.wait('@getFileInfo');
    });

    it('should show password field', () => {
      cy.get('input[id="password"]').should('be.visible');
    });

    it('should disable download button when password is empty', () => {
      cy.contains('button', 'Télécharger').should('be.disabled');
    });

    it('should enable download button when password is filled', () => {
      cy.get('input[id="password"]').type('Password1!');
      cy.contains('button', 'Télécharger').should('not.be.disabled');
    });

    it('should show error alert for wrong password', () => {
      cy.intercept('POST', '/api/files/download*', {
        statusCode: 401,
        body: { message: 'Unauthorized' }
      }).as('getFileLink');

      cy.get('input[id="password"]').type('wrong-password');

      cy.on('window:alert', (text) => {
        expect(text).to.contains('Mot de passe incorrect');
      });

      cy.contains('button', 'Télécharger').click();
    });
  });
  
  describe('Expired file', () => {

    beforeEach(() => {
      cy.intercept('GET', '/api/files/info*', {
        statusCode: 200,
        body: files.expiredFile
      }).as('getFileInfo');

      cy.visit(getDownloadUrl(files.expiredFile.fileToken));
      cy.wait('@getFileInfo');
    });

    it('should show expired message and hide download form', () => {
      cy.contains('Ce fichier n\'est plus disponible').should('be.visible');
      cy.contains('button', 'Télécharger').should('not.exist');
    });
  });

  describe('Missing or invalid token', () => {

    it('should redirect to home if no token in URL', () => {
      cy.visit('/files/download');
      cy.url().should('eq', BASE_URL + '/');
    });

    it('should redirect to home if file not found', () => {
      cy.intercept('GET', '/api/files/info*', {
        statusCode: 404,
        body: { message: 'File not found' }
      }).as('getFileInfo');

      cy.visit('/files/download?fileToken=mock-token-notfound');
      cy.url().should('eq', BASE_URL + '/');
    });
  });

  describe('Network error handling', () => {

    beforeEach(() => {
      cy.intercept('GET', '/api/files/info*', {
        statusCode: 500,
        body: { message: 'Network error' }
      }).as('getFileInfo');

      cy.visit(getDownloadUrl(files.validFile.fileToken));
      cy.wait('@getFileInfo');
    });

    it('should show error alert', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Network error');
      });
    });
  });

  describe('Should download file successfully', () => {

    const validFile = files.validFile;
    const fileLink = 'https://mock-storage.com/files/test-file.pdf';

    beforeEach(() => {
      cy.intercept('GET', '/api/files/info*', {
        statusCode: 200,
        body: validFile
      }).as('getFileInfo');

      // Mock getFileLink (POST /api/files/download)
      cy.intercept('POST', '/api/files/download*', {
        statusCode: 200,
        body: { fileLink: fileLink }
      }).as('getFileLink');

      // Mock downloadFile (GET sur l'URL du blob)
      cy.intercept('GET', fileLink, {
        statusCode: 200,
        body: 'contenu du fichier test',
        headers: { 'Content-Type': 'application/pdf' }
      }).as('downloadBlob');

      cy.visit(getDownloadUrl(validFile.fileToken));
      cy.wait('@getFileInfo');
    });

    it('should trigger file download when clicking "Télécharger"', () => {
      cy.window().then((win) => {
        // Stub URL.createObjectURL
        const createStub = cy.stub(win.URL, 'createObjectURL').returns('blob:mock-url');
        cy.wrap(createStub).as('createObjectURL');

        // Stub URL.revokeObjectURL
        const revokeStub = cy.stub(win.URL, 'revokeObjectURL');
        cy.wrap(revokeStub).as('revokeObjectURL');
      });

      cy.intercept('POST', '/api/files/download*', {
        statusCode: 200,
        body: { fileLink: fileLink }
      }).as('getFileLink');

      cy.intercept('GET', fileLink, {
        statusCode: 200,
        body: 'contenu du fichier test',
        headers: { 'Content-Type': 'application/pdf' }
      }).as('downloadBlob');

      cy.contains('button', 'Télécharger').click();
      cy.wait('@getFileLink');
      cy.wait('@downloadBlob');

      cy.get('@createObjectURL').should('have.been.calledOnce');
      cy.get('@revokeObjectURL').should('have.been.calledWith', 'blob:mock-url') ;
    });

    it('should show alert for any error during download', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Une erreur est survenue lors du téléchargement du fichier.');
      });

      // Mock getFileLink to return 500 error
      cy.intercept('POST', '/api/files/download*', {
        statusCode: 500,
        body: { message: 'Server error' }
      }).as('getFileLinkError');

      cy.contains('button', 'Télécharger').click();
      cy.wait('@getFileLinkError');
    });

    it('should show alert for empty file blob', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Le fichier est vide ou impossible à télécharger.');
      });

      // Mock downloadFile to return empty blob
      cy.intercept('GET', fileLink, {
        statusCode: 200,
        body: '',
        headers: { 'Content-Type': 'application/pdf' }
      }).as('downloadEmptyBlob');

      cy.contains('button', 'Télécharger').click();
      cy.wait('@downloadEmptyBlob');
    });
  });

});
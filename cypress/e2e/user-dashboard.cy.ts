import files from '../fixtures/files.json';

const validFile = files.validFile;
const validPasswordProtectedFile = files.passwordProtectedFile;
const expiredFile = files.expiredFile;
const expiredPasswordProtectedFile = files.expiredPasswordProtectedFile;

function goToDashboard() {
  cy.login();

    // Primary path: navigate through authenticated header button.
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Mon espace")').length > 0) {
        cy.contains('button', 'Mon espace', { timeout: 10000 }).should('be.visible').click();
      } else {
        // Fallback path when session restore lands elsewhere.
        cy.visit('/files/upload', { timeout: 10000, failOnStatusCode: false });
        cy.contains('button', 'Mon espace', { timeout: 10000 }).should('be.visible').click();
      }
    });

    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/files');
}

describe('User Dashboard', () => {

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    goToDashboard();
  });

  describe('Dashboard accessibility', () => {
    it('should redirect to login page if not logged in', () => {
      cy.clearCookies();
      cy.visit('/dashboard/files');
      cy.url().should('include', '/login');
    });
  });

  describe('UI Elements', () => {

    it('should display all the main UI elements', () => {
      // Main page title
      cy.contains('h2', 'Mes Fichiers', { timeout: 10000 }).should('be.visible');
      // Header buttons
      cy.contains('Ajouter des fichiers').should('be.visible');
      cy.contains('Déconnexion').should('be.visible');
      // Sidebar navigation links + footer 
      cy.contains('a', 'Mes fichiers').should('be.visible');
      cy.contains('footer', 'Copyright').should('be.visible');
      // File filter buttons
      cy.contains('button', 'Tous').should('be.visible');
      cy.contains('button', 'Actif').should('be.visible');
      cy.contains('button', 'Expiré').should('be.visible');
    });
  });

  describe('Filters', () => {

    it('should show only active files by default', () => {
      cy.contains('h3', validFile.filename).should('be.visible');
      cy.contains('h3', validPasswordProtectedFile.filename).should('be.visible');
      cy.contains('h3', expiredFile.filename).should('not.exist');
    });

    it('should show all files when "Tous" is selected', () => {
      cy.contains('button', 'Tous').click();

      cy.contains('h3', validFile.filename).should('be.visible');
      cy.contains('h3', validPasswordProtectedFile.filename).should('be.visible');
      cy.contains('h3', expiredFile.filename).should('be.visible');
    });

    it('should show only expired files when "Expiré" is selected', () => {
      cy.contains('button', 'Expiré').click();

      cy.contains('h3', expiredFile.filename).should('be.visible');
      cy.contains('h3', validFile.filename).should('not.exist');
      cy.contains('h3', validPasswordProtectedFile.filename).should('not.exist');
      cy.contains('p', 'Expiré').should('be.visible');
      cy.contains('p', 'Expiré').should('have.class', 'text-red-600');
    });

    it('should highlight the active filter button', () => {
      cy.contains('button', 'Expiré').click();
      cy.contains('button', 'Expiré').should('have.class', 'text-white');
    });
  });

  describe('Protected file indicator', () => {

    it('should show a lock icon for password-protected files', () => {
      cy.contains('h3', validPasswordProtectedFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .find('img[alt="Protected"]')
        .should('be.visible');
    });

    it('should not show a lock icon for non-protected files', () => {
      cy.contains('h3', validFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .find('img[alt="Protected"]')
        .should('not.exist');
    });

    it('should not show a lock icon for expired files even if protected', () => {
      cy.contains('button', 'Tous').click();
      cy.contains('h3', expiredPasswordProtectedFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .find('img[alt="Protected"]')
        .should('not.exist');
    });
  });

  describe('View file', () => {

    it('should navigate to file-download page with correct token when clicking "Accéder"', () => {
      cy.contains('h3', validFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .contains('button', 'Accéder')
        .click();

      cy.url().should('include', '/files/download');
      cy.url().should('include', `fileToken=${validFile.fileToken}`);
    });
  }); 

  describe('Delete file', () => {

    it('should delete the file after confirmation', () => {
      cy.on('window:confirm', () => true); // simulate user clicking "OK"

      cy.contains('h3', validFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .contains('button', 'Supprimer')
        .click();

      cy.wait('@deleteFile');

      // Success message should appear
      cy.contains('deleted successfully').should('be.visible');

      // File should disappear from the list
      cy.contains('h3', validFile.filename).should('not.exist');
    });

    it('should not delete the file if confirmation is cancelled', () => {
      cy.on('window:confirm', () => false); // simulate user clicking "Cancel"

      cy.contains('h3', validFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .contains('button', 'Supprimer')
        .click();

      // File should still be visible
      cy.contains('h3', validFile.filename).should('be.visible');
    });

    it('should show error message if delete fails', () => {
      cy.intercept('DELETE', '/api/files/delete/*', {
        statusCode: 500,
        body: { message: 'Server error' }
      }).as('deleteFileError');

      cy.on('window:confirm', () => true);

      cy.contains('h3', validFile.filename)
        .parents('.flex.items-center.rounded-lg')
        .contains('button', 'Supprimer')
        .click();

      cy.wait('@deleteFileError');
      cy.contains('Error deleting file').should('be.visible');
      cy.contains('h3', validFile.filename).should('be.visible'); // still present
    });
  });

  describe('Navigation', () => {

    it('should navigate to upload page when clicking "Ajouter des fichiers"', () => {
      cy.contains('a', 'Ajouter des fichiers').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/files/upload');
    });

    it('should navigate to dashboard when clicking sidebar "Mes fichiers"', () => {
      cy.contains('a', 'Mes fichiers').click();
      cy.url().should('include', '/dashboard/files');
    });

    it('should logout and redirect to login page', () => {
      cy.contains('button', 'Déconnexion').click();
      
      cy.url().should('include', '/login');
    });
  });

  describe('Empty state', () => {

    beforeEach(() => {
      cy.clearCookies();
      cy.intercept('GET', '/api/files/list*', {
        statusCode: 200,
        body: { message: 'No files found', files: [] }
      }).as('emptyListFiles');

      goToDashboard();
      cy.wait('@emptyListFiles');
    });

    it('should display nothing when user has no files', () => {
      cy.contains('h2', 'Mes Fichiers', { timeout: 10000 }).should('be.visible');
      cy.get('.flex.items-center.rounded-lg').should('not.exist');
    });
  });

});


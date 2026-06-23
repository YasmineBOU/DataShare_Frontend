import users from '../fixtures/users.json';

describe('Login page', () => {

  beforeEach(() => {
    // Avoid uncaught exceptions from the app to fail the test
    cy.on('uncaught:exception', () => false);
    cy.visit('/login');
  });

  describe('UI Elements', () => {

    it('should display all the required UI elements', () => {
      // Main title of the form
      cy.contains('h2', 'Connexion').should('be.visible'); 
      // Form fields and their labels
      cy.contains('label', 'Email').should('be.visible');
      cy.get('input[id="email"]').should('be.visible');      
      cy.contains('label', 'Mot de passe').should('be.visible');
      cy.get('input[id="password"]').should('be.visible');
      // Form Buttons
      cy.contains('a', 'Créer un compte').should('be.visible');
      cy.contains('button', 'Connexion').should('be.visible');
    });

    it('should have a functional "Créer un compte" link', () => {
      cy.contains('a', 'Créer un compte')
        .should('be.visible')
        .and('not.be.disabled');
      cy.contains('a', 'Créer un compte').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when fields are empty', () => {
      cy.contains('button', 'Connexion').click();
      cy.contains('Email requis').should('be.visible');
      cy.contains('Mot de passe requis').should('be.visible');
    });  
  });

  describe('Authentication Flow', () => {
    describe('Error Handling', () => {
      
       it(`should show an error message on 401 status error for invalid credentials`, () => {
            cy.get('input[id="email"]').type(users.userWithInvalidCredentials.email);
            cy.get('input[id="password"]').type(users.userWithInvalidCredentials.password);

          cy.on('window:alert', (text) => {
            expect(text).to.contains('Incorrect credentials, please try again.');
          });

          cy.contains('button', 'Connexion').click();
        });

      it('should show a generic error message for any other status code', () => {
        cy.get('input[id="email"]').type(users.serverErrorUser.email);
        cy.get('input[id="password"]').type(users.serverErrorUser.password);

        cy.on('window:alert', (text) => {
            expect(text).to.contains('An error occurred, please try again later.');
        });

        cy.contains('button', 'Connexion').click();
      });
    });
    
    it('should redirect to home after successful login', () => {
      // Mock /api/auth/me call after successful login
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { authenticated: true, email: users.registeredUser.email }
      }).as('authMe');

      cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: { message: 'Login successful' }
      }).as('loginRequest');

      cy.get('input[id="email"]').type(users.registeredUser.email);
      cy.get('input[id="password"]').type(users.registeredUser.password);
      cy.contains('button', 'Connexion').click();

      cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
      cy.wait('@authMe');

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('should store authToken cookie after successful login', () => {
      cy.intercept('GET', '/api/auth/me', {
        body: { authenticated: true, email: users.registeredUser.email }
      }).as('authMe');

      cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: { message: 'Login successful' },
        headers: { 'Set-Cookie': 'authToken=mock-token; Path=/' }
      }).as('loginRequest');

      cy.get('input[id="email"]').type(users.registeredUser.email);
      cy.get('input[id="password"]').type(users.registeredUser.password);
      cy.contains('button', 'Connexion').click();

      cy.wait('@loginRequest');
      cy.getCookie('authToken').should('exist');
    });
  });
})
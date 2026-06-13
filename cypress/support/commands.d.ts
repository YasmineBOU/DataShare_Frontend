/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom login command that:
       * - Sends a POST request to /api/login with user credentials
       * - Automatically stores the JWT cookie returned by the backend
       * - Simulates a real login flow
       *
       * @example
       *    cy.login() // Logs in with the registered user from fixtures/users.json
       */
      login(): Chainable<void>;
    }
  }
}

export {};

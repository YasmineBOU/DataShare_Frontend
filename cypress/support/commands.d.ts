/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Se connecte avec un utilisateur enregistré pour les tests E2E
       * @example
       *    cy.login() // Se connecte avec l'utilisateur enregistré dans fixtures/users.json
       */
      login(): Chainable<void>;
    }
  }
}

export {};

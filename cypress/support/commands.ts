/// <reference types="cypress" />
/// <reference path="./commands.d.ts" />

import users from '../fixtures/users.json';
import cookies from '../fixtures/cookies.json';

/**
 * Custom login command that:
 * - Sends a POST request to /api/login with user credentials
 * - Automatically stores the JWT cookie returned by the backend
 * - Simulates a real login flow
 *
 * Usage:
 *   cy.login() // Logs in with the registered user from fixtures/users.json
 */

Cypress.Commands.add('login', () => {
  const testUser = users.registeredUser;
  const sessionName = `user-session-${testUser.email}`;
  cy.session(
    sessionName, // Session name
    () => {
      // 1. Visit the login page to initialize the session
      cy.visit('/login');

      // 2. Fill in the login form with the test user's credentials
      cy.get('input[id="email"]').type(testUser.email);
      cy.get('input[id="password"]').type(testUser.password);

      // 3. Intercept the login request to capture the response
      cy.intercept('POST', '/api/login').as('loginRequest');

      // 4. Submit the login form
      cy.contains('button', 'Connexion').click();

      // 5. Wait for the login request to complete and assert the response status
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

      // 6. Verify that the JWT cookie is set in the browser after login
      cy.getCookie(cookies.tokenKey).then((cookie) => {
        if (!cookie) {
          throw new Error(`JWT cookie "${cookies.tokenKey}" not found after login. Ensure the backend sets the cookie correctly.`);
        }
        cy.wrap(cookie.value).as(cookies.tokenKey);
      });
    },
    {
      // Cache les données de session pour éviter de se reconnecter à chaque test
      cacheAcrossSpecs: true,
      validate: () => {
        cy.getCookie(cookies.tokenKey).should('exist');
        cy.request({
          method: 'GET',
          url: '/api/auth/me',
          failOnStatusCode: false
        })
          .its('body.authenticated')
          .should('eq', true);
      },
    }
  );
});


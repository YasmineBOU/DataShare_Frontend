describe('Register page', () => {

  const users = require('../fixtures/users.json');
  const registerConfig = require('../fixtures/config.mock.json').REGISTER_CONFIG;

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    cy.visit('/register');
  });

  describe('UI Elements', () => {

    it('should display all the required UI elements', () => {
      // Main title of the form
      cy.contains('h2', 'Créer un compte').should('be.visible');
      // Form fields and their labels
      cy.contains('label', 'Email').should('be.visible');
      cy.get('input[id="email"]').should('be.visible');
      cy.contains('label', 'Mot de passe').should('be.visible');
      cy.get('input[id="password"]').should('be.visible');
      cy.contains('label', 'Vérification du mot de passe').should('be.visible');
      cy.get('input[id="confirmPassword"]').should('be.visible');
      // Form Buttons
      cy.contains('a', 'J\'ai déjà un compte').should('be.visible');
      cy.contains('button', 'Créer mon compte').should('be.visible');
    });

    it('should have a functional "J\'ai déjà un compte" link', () => {
      cy.contains('a', 'J\'ai déjà un compte').should('be.visible').click();
      cy.url().should('include', '/login');
    });
    
  });

  describe('Form Validation', () => {
    it('should show validation errors when email is empty', () => {
      
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Veuillez entrer une adresse e-mail valide.');
      });

      cy.contains('button', 'Créer mon compte').click();
    });

    it('should show validation errors when email is invalid', () => {
      cy.get('input[id="email"]').type(users.newUserWithInvalidEmail.email);
      cy.contains('button', 'Créer mon compte').click();

      cy.on('window:alert', (text) => {
        expect(text).to.contains('Veuillez entrer une adresse e-mail valide.');
      });
      cy.contains('p', 'Veuillez saisir une adresse email valide').should('be.visible');
    });
    
    describe('Handling invalid passwords', () => {
     
      const passErrorMessage = `Le mot de passe doit comporter au moins une lettre, un chiffre, un caracter special et être d\'une longueur d\'au moins ${registerConfig.PASSWORD_MIN_LENGTH} caractères.`;
      const alertMessageError = 'Veuillez remplir tous les champs requis.';

      it('should show validation errors when password is empty', () => {
        cy.get('input[id="email"]').type(users.newUserWithShortPassword.email);
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains(alertMessageError);
        });

        cy.contains('button', 'Créer mon compte').click();
      });

      it('should show validation errors when password is too short', () => {
        cy.get('input[id="email"]').type(users.newUserWithShortPassword.email);
        cy.get('input[id="password"]').type(users.newUserWithShortPassword.password);
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains(alertMessageError);
        });
        cy.contains('button', 'Créer mon compte').click();

        cy.contains('p', passErrorMessage).should('be.visible');
      });

      it('should show validation errors when password does not contain a special character', () => {
        cy.get('input[id="email"]').type(users.newUserWithMissingSpecialCharacter.email);
        cy.get('input[id="password"]').type(users.newUserWithMissingSpecialCharacter.password);
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains(alertMessageError);
        });

        cy.contains('button', 'Créer mon compte').click();
        
        cy.contains('p', passErrorMessage).should('be.visible');
      });

      it('should show validation errors when password does not contain a number', () => {
        cy.get('input[id="email"]').type(users.newUserWithMissingNumber.email);
        cy.get('input[id="password"]').type(users.newUserWithMissingNumber.password);
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains(alertMessageError);
        });

        cy.contains('button', 'Créer mon compte').click();
        
        cy.contains('p', passErrorMessage).should('be.visible');
      });

      it('should show validation errors when password does not contain an uppercase letter', () => {
        cy.get('input[id="email"]').type(users.newUserWithMissingUppercase.email);
        cy.get('input[id="password"]').type(users.newUserWithMissingUppercase.password);
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains(alertMessageError);
        });

        cy.contains('button', 'Créer mon compte').click();
        
        cy.contains('p', passErrorMessage).should('be.visible');
      });

      it('should show validation errors when password does not contain a lowercase letter', () => {
        cy.get('input[id="email"]').type(users.newUserWithMissingLowercase.email);
        cy.get('input[id="password"]').type(users.newUserWithMissingLowercase.password);
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains(alertMessageError);
        });

        cy.contains('button', 'Créer mon compte').click();
        
        cy.contains('p', passErrorMessage).should('be.visible');
      });

      it('should show error when confirmPassword is empty', () => {
          cy.get('input[id="email"]').type(users.newUserWithValidCredentials.email);
          cy.get('input[id="password"]').type(users.newUserWithValidCredentials.password);
          
          cy.on('window:alert', (text) => {
            expect(text).to.contains('Veuillez renseigner tous les champs requis.');
          });

          cy.contains('button', 'Créer mon compte').click();
      });
  
      it('should show error when password and confirmPassword do not match', () => {
          cy.get('input[id="email"]').type(users.newUserWithValidCredentials.email);
          cy.get('input[id="password"]').type(users.newUserWithValidCredentials.password);
          cy.get('input[id="confirmPassword"]').type('DifferentPassword123!');
          
          cy.on('window:alert', (text) => {
            expect(text).to.contains('Les mots de passe ne correspondent pas, Veuillez réessayer.');
          });

          cy.contains('button', 'Créer mon compte').click();
      });
    });

  });


  describe('Register Flow', () => {
    it('should show an error message for already existing user', () => {
      cy.get('input[id="email"]').type(users.registeredUser.email);
      cy.get('input[id="password"]').type(users.registeredUser.password);
      cy.get('input[id="confirmPassword"]').type(users.registeredUser.password);

      cy.on('window:alert', (text) => {
          expect(text).to.contains('Something went wrong');
      });

      cy.contains('button', 'Créer mon compte').click();

    });

    it('should navigate to the "/login" page after successful registration', () => {
      cy.get('input[id="email"]').type(users.newUserWithValidCredentials.email);
      cy.get('input[id="password"]').type(users.newUserWithValidCredentials.password);
      cy.get('input[id="confirmPassword"]').type(users.newUserWithValidCredentials.password);

      cy.on('window:alert', (text) => {
        expect(text).to.contains('Compte créé avec succès, vous pouvez maintenant vous connecter.');
      });

      cy.contains('button', 'Créer mon compte').click();
      cy.url().should('include', '/login');
    });
  });

});

describe('File Upload page', () => {

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    cy.visit('/');
  });

  describe('Initial state', () => {
    it('should display all the required UI elements', () => {
      cy.contains('h1', 'Tu veux partager un fichier ?').should('be.visible');
      cy.get('input[id="file-upload"]').should('exist');
    });
  });

  describe('After valid file selection', () => {

    beforeEach(() => {
      // Simulate file selection by attaching a file to the input
      cy.get('input[id="file-upload"]').selectFile({
        contents: Cypress.Buffer.from('contenu du fichier test'),
        fileName: 'test-file.pdf',
        mimeType: 'application/pdf',
      }, { force: true }); // force: true is needed to bypass the hidden input
    });

    it('should display the form after valid file selection', () => {
      cy.contains('h1', 'Ajouter un fichier').should('be.visible');
      cy.contains('p', 'test-file.pdf').should('be.visible');
      cy.contains('span', 'Changer').should('be.visible');

      cy.get('input[id="password"]').should('be.visible');
      cy.get('select[id="expiration"]').should('be.visible');
      
      cy.contains('button', 'Téléverser').should('be.visible');
    });

    it('should show all expiration options', () => {
      cy.get('select[id="expiration"]').find('option').should('have.length', 7);
    });

    it('should have the default expiration set to 7 days', () => {
      cy.get('select[id="expiration"]').find('option:selected').should('include.text', 'Une semaine');
    });

    describe('Password validation handling', () => {
      
      it('should show validation error for short password', () => {
        cy.get('input[id="password"]').type('abc').blur(); // too short
        cy.get('select[id="expiration"]').select('Une semaine'); // valid expiration to isolate password validation 
        cy.contains('Le mot de passe doit comporter').should('be.visible');
      });

      it('should show validation error for missing a letter', () => {
        cy.get('input[id="password"]').type('123456').blur(); // missing a letter
        cy.get('select[id="expiration"]').select('Une semaine'); // valid expiration to isolate password validation 
        cy.contains('Le mot de passe doit comporter').should('be.visible');
      });

      it('should show validation error for missing a digit', () => {
        cy.get('input[id="password"]').type('abcdef').blur(); // missing a digit
        cy.get('select[id="expiration"]').select('Une semaine'); // valid expiration to isolate password validation 
        cy.contains('Le mot de passe doit comporter').should('be.visible');
      });

      it('should not show error for valid password', () => {
        cy.get('input[id="password"]').type('abc123').blur(); // valid password
        cy.get('select[id="expiration"]').select('Une semaine'); // valid expiration to isolate password validation
        cy.contains('Le mot de passe doit comporter').should('not.exist');
      });

      it('should accept an empty password (optional)', () => {
        cy.get('input[id="password"]').should('have.value', '');
        cy.contains('Le mot de passe doit comporter').should('not.exist');
      });

    });
    
  });

  describe('Invalid file selection', () => {

    it('should show alert and stay on initial state for forbidden extension', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.contains('n\'est pas autorisé');
      });

      cy.get('input[id="file-upload"]').selectFile({
        contents: Cypress.Buffer.from('malicious content'),
        fileName: 'virus.exe',
        mimeType: 'application/octet-stream',
      }, { force: true });

      // Should remain on the initial state
      cy.contains('h1', 'Tu veux partager un fichier ?').should('be.visible');
      cy.contains('h1', 'Ajouter un fichier').should('not.exist');
    });

    it('should show alert for oversized file', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.contains('trop volumineux');
      });

      // Create a file larger than the maximum allowed size (1GB) using Cypress.Buffer
      cy.window().then((win) => {
        // Stub pour simuler un fichier trop lourd
        const largeFile = new win.File(
          [new win.Blob(['x'])],
          'big-file.pdf',
          { type: 'application/pdf' }
        );
        Object.defineProperty(largeFile, 'size', { value: 2 * 1024 * 1024 * 1024 }); // 2GB

        const dataTransfer = new win.DataTransfer();
        dataTransfer.items.add(largeFile);

        const input = win.document.getElementById('file-upload') as HTMLInputElement;
        Object.defineProperty(input, 'files', { value: dataTransfer.files });
        input.dispatchEvent(new win.Event('change', { bubbles: true }));
      });

      cy.contains('h1', 'Tu veux partager un fichier ?').should('be.visible');
    });
  });  

  describe('After file upload on server', () => {

    describe('Successful upload', () => {
      it('should display the download link after successful upload', () => {

        cy.get('input[id="file-upload"]').selectFile({
          contents: Cypress.Buffer.from('contenu test'),
          fileName: 'document.pdf',
          mimeType: 'application/pdf',
        }, { force: true });

        cy.on('window:alert', (text) => {
          expect(text).to.contains('Fichier uploadé avec succès');
        });

        cy.contains('button', 'Téléverser').click();

        // Download link should be visible with the correct token
        cy.contains('Félicitations').should('be.visible');
        cy.contains('mock-token-abc123').should('be.visible');
        cy.contains('button', 'Copier le lien').should('be.visible');
      });

      it('should copy the download link to clipboard', () => {
        cy.window().then((win) => {
          const clipboardStub = cy.stub(win.navigator.clipboard, 'writeText').resolves();
          cy.wrap(clipboardStub).as('clipboard');
        });

        cy.get('input[id="file-upload"]').selectFile({
          contents: Cypress.Buffer.from('contenu test'),
          fileName: 'test-file.pdf',
          mimeType: 'application/pdf',
        }, { force: true });

        cy.on('window:alert', () => true); // ignore alert

        cy.contains('button', 'Téléverser').click();

        cy.contains('button', 'Copier le lien').should('be.visible').click();

        // check that clipboard.writeText was called with the correct download URL containing the token
        cy.get('@clipboard').should('have.been.calledOnce');
        cy.get('@clipboard').should('have.been.calledWithMatch',
          /\/files\/download\?fileToken=mock-token-abc123/
        );
      });
    });

    describe('Error handling', () => {
      it('should display timeout error on exceeding timeout', () => {

        cy.get('input[id="file-upload"]').selectFile({
          contents: Cypress.Buffer.from('contenu test'),
          fileName: 'timeout-file.pdf',
          mimeType: 'application/pdf',
        }, { force: true });

        cy.on('window:alert', (text) => {
          expect(text).to.contains('L\'upload a expiré. Vérifiez votre connexion réseau et réessayez.');
        });

        cy.contains('button', 'Téléverser').click();
      });

      it('should display server error on backend error', () => {

        cy.get('input[id="file-upload"]').selectFile({
          contents: Cypress.Buffer.from('contenu test'),
          fileName: 'error-file.pdf',
          mimeType: 'application/pdf',
        }, { force: true });

        cy.on('window:alert', (text) => {
          expect(text).to.contains('Une erreur est survenue lors de l\'upload du fichier.');
        });

        cy.contains('button', 'Téléverser').click();
      });

      it('should display network error on instable connection', () => {

        cy.get('input[id="file-upload"]').selectFile({
          contents: Cypress.Buffer.from('contenu test'),
          fileName: 'network-error-file.pdf',
          mimeType: 'application/pdf',
        }, { force: true });

        cy.on('window:alert', (text) => {
          expect(text).to.contains('Erreur réseau détectée. Vérifiez votre connexion et réessayez.');
        });

        cy.contains('button', 'Téléverser').click();
      });
      
    });
  });

});
import users from './fixtures/users.json';
import files from './fixtures/files.json';

type MockUser = {
  email: string;
  password: string;
};

type RegisterBody = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

type UploadResponse = {
  fileToken: string;
};

type MockFile = {
  id: number;
  filename: string;
  fileSize: string;
  fileToken: string;
  hasPassword: boolean;
  expirationDate: string;
};

const typedUsers = users as Record<string, MockUser>;
const typedFiles = files as Record<string, MockFile>;

function isSameUser(email: string | undefined, user: MockUser): boolean {
  return email === user.email;
}

function createJwtToken(): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600
    })
  );

  return `${header}.${payload}.mock-signature`;
}

export function setupMockBackend(): void {
  let currentAuthenticatedEmail: string | null = typedUsers['registeredUser'].email;

  const allMockFiles: MockFile[] = Object.values(typedFiles);
  const fileByToken = allMockFiles.reduce<Record<string, MockFile>>((acc, file) => {
    acc[file.fileToken] = file;
    return acc;
  }, {});

  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────
  cy.intercept('POST', '/api/logout', {
    statusCode: 200,
    body: {}
  });

  // ─────────────────────────────────────────
  // AUTH ME
  // ─────────────────────────────────────────
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: { authenticated: true, email: currentAuthenticatedEmail }
  })

  // ─────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────
  cy.intercept("POST", "/api/login", (req) => {
    const body = req.body as LoginBody;

    if (body.email === typedUsers['serverErrorUser'].email) {
      req.reply({
        statusCode: 500,
        body: { message: "Unexpected server error" },
      });
      return;
    }

    if (isSameUser(body.email, typedUsers['registeredUser']) && body.password === typedUsers['registeredUser'].password){
      currentAuthenticatedEmail = typedUsers['registeredUser'].email;
      req.reply({
        statusCode: 200,
        headers: {
          'Set-Cookie': `authToken=${createJwtToken()}; Path=/; HttpOnly`,
        },
        body: { message: 'Login successful', authenticated: true, email: typedUsers['registeredUser'].email }
      });
      return;
    }

    if (isSameUser(body.email, typedUsers['newUserWithValidCredentials']) && body.password === typedUsers['newUserWithValidCredentials'].password) {
      currentAuthenticatedEmail = typedUsers['newUserWithValidCredentials'].email;
      req.reply({
        statusCode: 200,
        headers: {
          'Set-Cookie': `authToken=${createJwtToken()}; Path=/; HttpOnly`,
        },
        body: { message: 'Login successful', authenticated: true, email: typedUsers['newUserWithValidCredentials'].email }
      });
      return;
    }

    req.reply({
      statusCode: 401,
      body: {
        message: "Incorrect credentials",
      },
    });

  });

  

  // ─────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────
  cy.intercept("POST", "/api/register", (req) => {
    const body = req.body as RegisterBody;

    if (isSameUser(body.email, typedUsers['registeredUser'])) {
      req.reply({
        statusCode: 409,
        body: {
          error: "User already exists",
          status: 409,
          message: "Email already registered",
        },
      });
      return;
    }

    req.reply({
      statusCode: 201,
      body: {
        message: "User registered successfully",
        user: {
          id: 1,
          email: body.email ?? typedUsers['newUserWithValidCredentials'].email,
        },
      },
    });
  });

  
  // ─────────────────────────────────────────
  // FILE UPLOAD
  // ─────────────────────────────────────────
  cy.intercept("POST", "/api/files/upload", (req) => {
    const fileName = req.body.get?.('filename') || '';
    const filePassword = req.body.get?.('filePassword') || '';

    // Password protected file
    if (filePassword) {
      req.reply({
        statusCode: 200,
        body: { fileToken: "mock-token-protected" }
      });
      return;
    }

    // File that simulates a server error
    if (fileName === 'error-file.pdf') {
      req.reply({
        statusCode: 500,
        body: { message: "Internal server error" }
      });
      return;
    }
    // File that simulates a timeout
    if (fileName == "timeout-file.pdf") {
      req.reply({
        statusCode: 408,
        body: { name: "TimeoutError" },
      });
      return;
    }
    // File that simulates a payload too large error
    if (fileName == "network-error-file.pdf") {
      req.reply({
        statusCode: 0,
        body: { message: "Network error" }
      });
      return;
    }

    // Default case: successful upload
    req.reply({
      statusCode: 200,
      body: { fileToken: "mock-token-abc123" }
    });
  });


  
  // ─────────────────────────────────────────
  // FILE DOWNLOAD
  // ─────────────────────────────────────────
  cy.intercept("GET", "/api/files/download/*", (req) => {
    const fileToken = req.url.split('/').pop() ?? '';
    const targetFile = fileByToken[fileToken];

    if (!targetFile) {
      req.reply({
        statusCode: 404,
        body: { message: "File not found" }
      });
      return;
    }

    if (targetFile.hasPassword) {
      req.reply({
        statusCode: 401,
        body: { message: "Unauthorized" }
      });
      return;
    }

    req.reply({
      statusCode: 200,
      body: { message: "File downloaded successfully" }
    });
  });   

  // ─────────────────────────────────────────
  // FILE INFO
  // ─────────────────────────────────────────
  cy.intercept('GET', '/api/files/info*', (req) => {
    const queryToken = req.query['fileToken'];
    const fileToken = Array.isArray(queryToken) ? queryToken[0] : queryToken;
    const targetFile = fileToken ? fileByToken[fileToken] : undefined;

    if (!targetFile) {
      req.reply({ statusCode: 404, body: { message: 'File not found' } });
      return;
    }

    req.reply({
      statusCode: 200,
      body: {
        id: targetFile.id,
        filename: targetFile.filename,
        fileSize: targetFile.fileSize,
        hasPassword: targetFile.hasPassword,
        expirationDate: targetFile.expirationDate
      }
    });
  });

  // // ─────────────────────────────────────────
  // // FILE LINK (download)
  // // ─────────────────────────────────────────
  // cy.intercept('POST', '/api/files/download', (req) => {
  //   const { filePassword } = req.body;

  //   if (filePassword === 'wrong-password') {
  //     req.reply({ statusCode: 401, body: { message: 'Unauthorized' } });
  //     return;
  //   }

  //   req.reply({
  //     statusCode: 200,
  //     body: { fileLink: 'https://mock-storage.com/files/test-file.pdf' }
  //   });
  // });

  // ─────────────────────────────────────────
  // FILE LIST
  // ─────────────────────────────────────────
  cy.intercept('GET', '/api/files/list*', (req) => {
    const filesByEmail: Record<string, MockFile[]> = {
      [typedUsers['registeredUser'].email]: [
        typedFiles['validFile'],
        typedFiles['passwordProtectedFile'],
        typedFiles['expiredFile'],
        typedFiles['expiredPasswordProtectedFile']
      ],
      [typedUsers['newUserWithValidCredentials'].email]: [
        typedFiles['validFile'],
        typedFiles['expiredPasswordProtectedFile']
      ],
      ['userWithEmptyFileList@mail.com']: []
    };

    const queryEmail = req.query?.['email'];
    const requestedEmail = Array.isArray(queryEmail) ? queryEmail[0] : queryEmail;
    const resolvedEmail = (requestedEmail as string) || currentAuthenticatedEmail || typedUsers['registeredUser'].email;
    const userFiles = filesByEmail[resolvedEmail] ?? [];

    req.reply({
      statusCode: 200,
      body: {
        message: 'Files retrieved successfully',
        files: userFiles
      }
    });
  }).as('listFiles');

  // ─────────────────────────────────────────
  // FILE DELETE
  // ─────────────────────────────────────────
  cy.intercept('DELETE', '/api/files/delete/*', {
    statusCode: 200,
    body: { message: 'File deleted successfully' }
  }).as('deleteFile');

}

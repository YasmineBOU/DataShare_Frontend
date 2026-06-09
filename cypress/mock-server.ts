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

const users = require('./fixtures/users.json') satisfies Record<string, MockUser>;

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

  // ─────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────
  cy.intercept("POST", "/api/login", (req) => {
    const body = req.body as LoginBody;

    if (body.email === users.serverErrorUser.email) {
      req.reply({
        statusCode: 500,
        body: { message: "Unexpected server error" },
      });
      return;
    }

    if (isSameUser(body.email, users.registeredUser) && body.password === users.registeredUser.password){
      req.reply({
        statusCode: 200,
        // headers: {
        //   'Set-Cookie': `token=${createJwtToken()}; Path=/; HttpOnly`
        // },
        
        headers: {
          'Set-Cookie': `AUTH_TOKEN=${createJwtToken()}; Path=/; HttpOnly; Secure; SameSite=None`,
        },
        body: { message: 'Login successful' }
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

    if (isSameUser(body.email, users.registeredUser)) {
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
          email: body.email ?? users.newUserWithValidCredentials.email,
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


}

/**
 * Server entry point for the Angular Universal (SSR) application.
 * This file sets up an Express server to serve static files and handle Angular SSR rendering.
 * It also defines the request handler for both development and production environments.
 *
 * @see AngularNodeAppEngine
 * @see createNodeRequestHandler
 * @see isMainModule
 * @see writeResponseToNodeResponse
 * @see express
 */


import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

/**
 * Path to the browser distribution folder containing the compiled Angular application.
 */
const browserDistFolder = join(import.meta.dirname, '../browser');

/**
 * Express application instance used to serve static files and handle SSR requests.
 */
const app = express();

/**
 * Angular Node.js application engine for handling SSR requests.
 */
const angularApp = new AngularNodeAppEngine();

/**
 * Serves static files from the /browser directory.
 * Static files are cached for 1 year to optimize performance.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Middleware to handle all other requests by rendering the Angular application via SSR.
 * Uses the Angular Node.js application engine to process the request and render the response.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Starts the Express server if this module is the main entry point or is run via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler for Angular Universal.
 * This handler is used by the Angular CLI during development (dev-server) or build,
 * and can also be used with Firebase Cloud Functions or other serverless platforms.
 */
export const reqHandler = createNodeRequestHandler(app);

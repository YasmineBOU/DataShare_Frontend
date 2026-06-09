/**
 * Main entry point for the Angular application.
 * This file bootstraps the application using Angular's platform-browser and integrates the global configuration.
 * It starts the application and handles any errors that occur during the bootstrap process.
 *
 * @see bootstrapApplication
 * @see App
 * @see appConfig
 */

import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Bootstraps the Angular application with the root component {@link App} and global configuration {@link appConfig}.
 * If an error occurs during bootstrap, it logs the error to the console.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

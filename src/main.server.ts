/**
 * Main entry point for server-side rendering (SSR) of the Angular application.
 * This file bootstraps the application using Angular's server-side rendering mechanism
 * and integrates the server-specific configuration.
 *
 * @see BootstrapContext
 * @see bootstrapApplication
 * @see App
 * @see config
 */

import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { config } from './app/app.config.server';

/**
 * Server-side bootstrap function for the Angular application.
 * This function initializes the application with server-specific context and configuration.
 *
 * @param context - The {@link BootstrapContext} provided by the server for rendering.
 * @returns A promise that resolves to the application once bootstrapped.
 */
const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;

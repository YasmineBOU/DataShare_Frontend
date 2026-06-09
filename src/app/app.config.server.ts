/**
 * Server-side application configuration for Angular Universal (SSR).
 * This file defines the server-specific providers and settings required for server-side rendering.
 * It merges the client-side configuration with the server-side configuration to ensure
 * consistent behavior between server and browser environments.
 *
 * @see ApplicationConfig
 * @see provideServerRendering
 * @see withRoutes
 * @see appConfig
 * @see serverRoutes
 */

import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Server-specific configuration for Angular Universal (SSR).
 * This configuration includes the server-side rendering provider with routes.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

/**
 * Merged application configuration combining client-side and server-side settings.
 * This ensures that both environments use the same configuration while enabling SSR.
 *
 * @returns The merged {@link ApplicationConfig} for the application.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);

/**
 * Main application configuration for the Angular application.
 * This file defines the global providers and settings required for the application,
 * including HTTP client configuration, routing, client hydration, and interceptor setup.
 * It uses Zoneless Change Detection for improved performance and integrates with custom interceptors
 * for request handling.
 *
 * @see ApplicationConfig
 * @see provideHttpClient
 * @see provideRouter
 * @see provideClientHydration
 * @see provideBrowserGlobalErrorListeners
 * @see provideZonelessChangeDetection
 * @see ReactiveFormsModule
 */

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { fileTimeoutInterceptor } from './interceptors/file-timeout.interceptor';
import { loadingInterceptorFn } from './interceptors/loading.interceptor-fn';
import { tokenInterceptor } from './interceptors/token.interceptor';

/**
 * Main application configuration.
 * This configuration includes:
 * - Browser global error listeners.
 * - Router configuration with application routes.
 * - Client hydration for SSR (Server-Side Rendering).
 * - HTTP client configuration with fetch and custom interceptors.
 * - ReactiveFormsModule integration for form handling.
 * - Zoneless change detection for improved performance.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(), 
      withInterceptors([tokenInterceptor, fileTimeoutInterceptor, loadingInterceptorFn])
    ),
    importProvidersFrom(ReactiveFormsModule),
    provideZonelessChangeDetection()
  ]
};

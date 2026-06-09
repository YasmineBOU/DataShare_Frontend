/**
 * Server-side routes configuration for Angular Universal (SSR).
 * This file defines the server-side routes and their rendering modes.
 * It ensures that all routes are rendered on the server for improved SEO and performance.
 *
 * @see ServerRoute
 * @see RenderMode
 */

import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side routes configuration.
 * This configuration ensures that all routes are rendered on the server.
 */
export const serverRoutes: ServerRoute[] = [
  {
    /**
     * Wildcard path to match all routes.
     * This ensures that every route is rendered on the server.
     */
    path: '**',
    
    /**
     * Render mode for the route.
     * Set to {@link RenderMode.Server} to force server-side rendering.
     */
    renderMode: RenderMode.Server
  }
];

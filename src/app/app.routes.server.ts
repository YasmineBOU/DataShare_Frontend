/**
 * Client-Side Rendering (CSR) configuration.
 * This file defines the server-side routes and their rendering modes.
 * All undefined routes are rendered on the client side (CSR) for dynamic functionality.
 *
 * @see ServerRoute
 * @see RenderMode
 */

import { RenderMode, ServerRoute } from '@angular/ssr';


export const serverRoutes: ServerRoute[] = [
  {
    /**
     * Wildcard route for all undefined paths.
     *
     * This route is explicitly set to Client-Side Rendering (CSR) to:
     * 1. Enable smooth Single-Page Application (SPA) navigation
     * 2. Support client-side APIs (window, localStorage, etc.)
     * 3. Allow dynamic content loading without server-side constraints
     *
     * @property {string} path - Wildcard pattern ('**') to match all undefined routes
     * @property {RenderMode} renderMode - Explicitly set to RenderMode.Client (CSR)
     */
    path: '**',
    renderMode: RenderMode.Client
  }
];

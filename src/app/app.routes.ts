/**
 * Main application routes configuration.
 * This file defines all the routes for the Angular application, including public routes,
 * authentication routes, file upload/download routes, and dashboard routes.
 * It uses a PublicLayout for all routes and organizes nested routes for better structure.
 *
 * @see Routes
 * @see PublicLayout
 * @see Dashboard
 * @see FileDownload
 * @see FileListing
 * @see FileUpload
 * @see Login
 * @see Register
 */

import { Routes } from '@angular/router';

import { PublicLayout } from './layouts/public-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { FileDownload } from './pages/file-download/file-download';
import { FileListing } from './pages/file-listing/file-listing';
import { FileUpload } from './pages/file-upload/file-upload';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

/**
 * Main application routes configuration.
 * This configuration defines:
 * - A root layout using {@link PublicLayout}.
 * - Public routes for login, registration, and file upload/download.
 * - Dashboard routes with nested file listing.
 * - A wildcard route to redirect unmatched paths to the root.
 */
export const routes: Routes = [
  {
    /**
     * Root path using the {@link PublicLayout} for all child routes.
     */
    path: '',
    component: PublicLayout,
    children: [
      {
        /**
         * Default child route for the root path, rendering the {@link FileUpload} component.
         */
        path: '',
        component: FileUpload
      },
      {
        /**
         * Login route, rendering the {@link Login} component.
         */
        path: 'login',
        component: Login
      },
      {
        /**
         * Registration route, rendering the {@link Register} component.
         */
        path: 'register',
        component: Register
      },
      {
        /**
         * File-related routes, including upload and download.
         */
        path: 'files',
        children: [
          /**
           * File upload route, rendering the {@link FileUpload} component.
           */
          { path: 'upload', component: FileUpload },
          /**
           * File download route, rendering the {@link FileDownload} component.
           */
          { path: 'download', component: FileDownload },
        ]
      },
      {
        /**
         * Dashboard route, rendering the {@link Dashboard} component with nested file listing.
         */
        path: 'dashboard',
        component: Dashboard,
        children: [
          /**
           * Redirect to the 'files' child route by default.
           */
          { path: '', redirectTo: 'files', pathMatch: 'full' },
          /**
           * File listing route, rendering the {@link FileListing} component.
           */
          { path: 'files', component: FileListing }
        ]
      },
      {
        /**
         * Wildcard route to redirect unmatched paths to the root.
         */
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

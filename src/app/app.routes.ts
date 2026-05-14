import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { FileUpload } from './pages/file-upload/file-upload';
import { FileDownload } from './pages/file-download/file-download';
import { FileListing } from './pages/file-listing/file-listing';
import { PublicLayout } from './layouts/public-layout';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        component: FileUpload
      },
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      },
      {
        path: 'files',
        children: [
          { path: 'upload', component: FileUpload },
          { path: 'download/:id', component: FileDownload },
        ]
      },
      {
        path: 'dashboard',
        component: Dashboard,
        children: [
          { path: '', redirectTo: 'files', pathMatch: 'full' },
          { path: 'files', component: FileListing }
        ]
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

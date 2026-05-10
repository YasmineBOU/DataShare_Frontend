import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { FileUpload } from './pages/file-upload/file-upload';
import { FileDownload } from './pages/file-download/file-download';
import { FileListing } from './pages/file-listing/file-listing';
import { SingleFileDetails } from './pages/single-file-details/single-file-details';
import { PublicLayout } from './layouts/public-layout';

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
          { path: 'list', component: FileListing },
          { path: ':id', component: SingleFileDetails }
        ]
      }
    ]
  }
];

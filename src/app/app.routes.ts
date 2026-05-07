import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { FileUpload } from './pages/file-upload/file-upload';

export const routes: Routes = [
    
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
    path: 'upload-file',
    component: FileUpload
  }
];

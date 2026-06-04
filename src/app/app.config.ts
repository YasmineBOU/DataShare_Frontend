import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './interceptors/token.interceptor';
import { fileTimeoutInterceptor } from './interceptors/file-timeout.interceptor';
import { loadingInterceptorFn } from './interceptors/loading.interceptor-fn';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(), 
      withInterceptors([tokenInterceptor, fileTimeoutInterceptor, loadingInterceptorFn])
    ),
    importProvidersFrom(ReactiveFormsModule),
    provideZonelessChangeDetection()
  ]
};

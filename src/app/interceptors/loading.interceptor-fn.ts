/**
 * HTTP interceptor that manages the loading state of the application.
 * This interceptor shows a loading indicator when a request is made and hides it once the request completes or fails.
 * It uses the {@link LoadingService} to track the loading state.
 *
 * @see HttpInterceptorFn
 * @see LoadingService
 * @see finalize
 */

import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../core/service/loading.service';

/**
 * HTTP interceptor function that manages the loading state.
 * Shows the loading indicator when a request is initiated and hides it when the request completes or fails.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The HTTP request handler function.
 * @returns An {@link Observable} of type {@link HttpEvent} representing the response or error.
 */
export const loadingInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const loadingService = inject(LoadingService);
  loadingService.show();
  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};

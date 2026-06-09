/**
 * HTTP interceptor that adds credentials (cookies) to outgoing requests.
 * This interceptor ensures that the JWT token stored in an HttpOnly cookie is included in every request
 * to the backend API, enabling secure authentication.
 *
 * @see HttpInterceptorFn
 * @see HttpRequest
 * @see HttpHandlerFn
 */

import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * HTTP interceptor function that adds credentials to outgoing requests.
 * Clones the request and includes credentials (cookies) to ensure the JWT token is sent securely.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The HTTP request handler function.
 * @returns An {@link Observable} of type {@link HttpEvent} representing the response or error.
 */
export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  
  // Clone the request and include credentials (cookies) in all requests
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq);
};

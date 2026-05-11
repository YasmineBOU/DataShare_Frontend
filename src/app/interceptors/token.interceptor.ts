import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  
  // Clone the request and include credentials (cookies) in all requests
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq);
};

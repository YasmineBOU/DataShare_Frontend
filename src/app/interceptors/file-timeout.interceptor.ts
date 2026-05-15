import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

/**
 * Interceptor that applies a timeout to HTTP requests. The timeout duration is determined based on the type of request:
 * - Upload requests: 1 hour (3600000 ms)
 * - Other requests: 30 seconds (30000 ms)
 */
export const fileTimeoutInterceptor: HttpInterceptorFn = 
  (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    
    // Determine if this is an upload request
    const isFileUpload =
      ( 
        req.url.includes('/api/files/upload') 
      ) && 
        req.method === 'POST' && 
        req.body instanceof FormData;

    const isFileDownload =
      req.method === 'GET' && (
        req.responseType === 'blob' ||
        req.url.includes('/api/files/download') ||
        req.url.includes('backblazeb2.com') ||
        req.url.includes('amazonaws.com')
      );
    
    // Apply an appropriate timeout
    const timeoutDuration = (isFileUpload || isFileDownload) ? 7200000 : 30000; // 2 hours for large file transfers, 30 seconds otherwise

    return next(req).pipe(
      timeout(timeoutDuration)
    );
  };

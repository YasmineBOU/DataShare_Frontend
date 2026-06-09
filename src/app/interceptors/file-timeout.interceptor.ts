/**
 * HTTP interceptor that applies a timeout to outgoing requests based on the request type.
 * This interceptor ensures that file uploads and downloads have longer timeouts to accommodate large file transfers,
 * while other requests have a shorter timeout for better responsiveness.
 *
 * Timeout durations:
 * - File uploads: 2 hours (7200000 ms)
 * - File downloads: 2 hours (7200000 ms)
 * - Other requests: 30 seconds (30000 ms)
 *
 * @see HttpInterceptorFn
 * @see HttpRequest
 * @see HttpHandlerFn
 * @see timeout
 */

import { HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

/**
 * Interceptor that applies a timeout to HTTP requests.
 * The timeout duration is determined based on the type of request:
 * - File uploads and downloads: 2 hours (7200000 ms)
 * - Other requests: 30 seconds (30000 ms)
 *
 * @param req - The outgoing HTTP request.
 * @param next - The HTTP request handler function.
 * @returns An {@link Observable} of type {@link HttpEvent} representing the response or timeout error.
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

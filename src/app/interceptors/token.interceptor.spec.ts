import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => tokenInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should add withCredentials: true to the request', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = (clonedReq) => {
      expect((clonedReq as HttpRequest<any>).withCredentials).toBe(true);
      done();
      return of({} as HttpEvent<any>);
    };

    interceptor(req, next).subscribe();
  });

  it('should not modify the original request', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = (clonedReq) => {
      expect(clonedReq).not.toBe(req); // cloned, not the same reference
      done();
      return of({} as HttpEvent<any>);
    };

    interceptor(req, next).subscribe();
  });
});
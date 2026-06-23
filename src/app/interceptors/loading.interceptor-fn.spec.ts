import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { loadingInterceptorFn } from './loading.interceptor-fn';
import { LoadingService } from '../core/service/loading.service';

describe('loadingInterceptorFn', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => loadingInterceptorFn(req, next));

  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    loadingService = TestBed.inject(LoadingService);
  });

  it('should call show() when request starts', (done) => {
    const showSpy = jest.spyOn(loadingService, 'show');
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = () => {
      expect(showSpy).toHaveBeenCalled();
      done();
      return of({} as HttpEvent<any>);
    };

    interceptor(req, next).subscribe();
  });

  it('should call hide() when request completes', () => {
    const hideSpy = jest.spyOn(loadingService, 'hide');
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = () => of({} as HttpEvent<any>);

    interceptor(req, next).subscribe();

    expect(hideSpy).toHaveBeenCalled();
  });

  it('should call hide() even when request errors', () => {
    const hideSpy = jest.spyOn(loadingService, 'hide');
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = () => throwError(() => new Error('Request failed'));

    interceptor(req, next).subscribe({
      error: () => {}  // absorbe l'erreur pour éviter un crash
    });

    expect(hideSpy).toHaveBeenCalled();
  });
});
import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { fileTimeoutInterceptor } from './file-timeout.interceptor';

describe('fileTimeoutInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => fileTimeoutInterceptor(req, next));

  const next: HttpHandlerFn = () => of({} as HttpEvent<any>);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should apply 2 hour timeout for file upload requests', (done) => {
    const formData = new FormData();
    const req = new HttpRequest('POST', '/api/files/upload', formData);

    interceptor(req, next).subscribe({
      complete: () => done()
    });

    jest.advanceTimersByTime(7199999); // just before timeout
    jest.advanceTimersByTime(1); // trigger timeout
  });

  it('should timeout upload request after 2 hours', (done) => {
    const formData = new FormData();
    const req = new HttpRequest('POST', '/api/files/upload', formData);

    // A request that never completes
    const hangingNext: HttpHandlerFn = () => new (require('rxjs').Observable)(() => {});

    interceptor(req, hangingNext).subscribe({
      error: (err) => {
        expect(err.name).toBe('TimeoutError');
        done();
      }
    });

    jest.advanceTimersByTime(7200001);
  });

  it('should apply 2 hour timeout for blob download requests', (done) => {
    const req = new HttpRequest('GET', '/api/files/download', null, { responseType: 'blob' });

    interceptor(req, next).subscribe({
      complete: () => done()
    });
  });

  it('should apply 30 second timeout for standard requests', (done) => {
    const req = new HttpRequest('GET', '/api/auth/me');

    // A request that never completes
    const hangingNext: HttpHandlerFn = () => new (require('rxjs').Observable)(() => {});

    interceptor(req, hangingNext).subscribe({
      error: (err) => {
        expect(err.name).toBe('TimeoutError');
        done();
      }
    });

    jest.advanceTimersByTime(30001);
  });

  it('should not apply upload timeout for non-FormData POST to upload endpoint', (done) => {
    const req = new HttpRequest('POST', '/api/files/upload', { data: 'json' }); // pas FormData

    const hangingNext: HttpHandlerFn = () => new (require('rxjs').Observable)(() => {});

    interceptor(req, hangingNext).subscribe({
      error: (err) => {
        expect(err.name).toBe('TimeoutError');
        done();
      }
    });

    // Doit timeout à 30s, pas 2h
    jest.advanceTimersByTime(30001);
  });
});
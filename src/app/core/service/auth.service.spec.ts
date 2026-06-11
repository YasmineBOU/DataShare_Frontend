import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should return false by default', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true after successful loadCurrentUser', () => {
      authService.loadCurrentUser().subscribe();
      const req = httpMock.expectOne('/api/auth/me');
      req.flush({ authenticated: true, email: 'test@example.com' });
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false after failed loadCurrentUser', () => {
      authService.loadCurrentUser().subscribe();
      const req = httpMock.expectOne('/api/auth/me');
      req.error(new ProgressEvent('error'));
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('currentEmail', () => {
    it('should return null by default', () => {
      expect(authService.currentEmail).toBeNull();
    });

    it('should return email after successful loadCurrentUser', () => {
      authService.loadCurrentUser().subscribe();
      const req = httpMock.expectOne('/api/auth/me');
      req.flush({ authenticated: true, email: 'test@example.com' });
      expect(authService.currentEmail).toBe('test@example.com');
    });

    it('should return null if not authenticated', () => {
      authService.loadCurrentUser().subscribe();
      const req = httpMock.expectOne('/api/auth/me');
      req.flush({ authenticated: false, email: null });
      expect(authService.currentEmail).toBeNull();
    });
  });

  describe('loadCurrentUser', () => {
    it('should return authenticated response', () => {
      const mockResponse = { authenticated: true, email: 'test@example.com' };
      authService.loadCurrentUser().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      const req = httpMock.expectOne('/api/auth/me');
      req.flush(mockResponse);
    });

    it('should return unauthenticated response on error', () => {
      authService.loadCurrentUser().subscribe(response => {
        expect(response.authenticated).toBe(false);
        expect(response.email).toBeNull();
      });
      const req = httpMock.expectOne('/api/auth/me');
      req.error(new ProgressEvent('error'));
    });
  });

  describe('logout', () => {
    it('should call logout endpoint and clear currentEmail', () => {
      authService.loadCurrentUser().subscribe();
      httpMock.expectOne('/api/auth/me').flush({ authenticated: true, email: 'test@example.com' });
      expect(authService.currentEmail).toBe('test@example.com');

      authService.logout().subscribe();
      const req = httpMock.expectOne('/api/logout');
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(authService.currentEmail).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
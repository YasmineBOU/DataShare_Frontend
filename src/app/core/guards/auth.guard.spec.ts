import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { AuthService } from '../service/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: { loadCurrentUser: jest.Mock };
  let routerMock: { parseUrl: jest.Mock };

  beforeEach(() => {
    authServiceMock = {
      loadCurrentUser: jest.fn()
    };
    routerMock = {
      parseUrl: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should allow navigation when user is authenticated', async () => {
    authServiceMock.loadCurrentUser.mockReturnValue(
      of({ authenticated: true, email: 'johndoe@example.com' })
    );

    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as any, {} as any) as any)
    );

    expect(result).toBe(true);
    expect(routerMock.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', async () => {
    const loginUrlTree = {} as UrlTree;
    authServiceMock.loadCurrentUser.mockReturnValue(
      of({ authenticated: false, email: null })
    );
    routerMock.parseUrl.mockReturnValue(loginUrlTree);

    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as any, {} as any) as any)
    );

    expect(routerMock.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBe(loginUrlTree);
  });
});

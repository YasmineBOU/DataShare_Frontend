import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/service/auth.service';
import { BehaviorSubject, of } from 'rxjs';

describe('App', () => {
  let authServiceMock: Partial<AuthService>;

   beforeEach(async () => {
    const currentEmailSubject = new BehaviorSubject<string | null>(null);

    authServiceMock = {
      logout: jest.fn().mockReturnValue(of({})),
      loadCurrentUser: jest.fn().mockReturnValue(of({ authenticated: false, email: null })),
      isAuthenticated: jest.fn().mockReturnValue(false),
      currentEmail$: currentEmailSubject.asObservable(),
      currentEmail: null
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ],
    }).compileComponents();
  });


  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call loadCurrentUser on init', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(authServiceMock.loadCurrentUser).toHaveBeenCalled();
  });
});
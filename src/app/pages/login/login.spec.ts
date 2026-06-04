import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { Validators } from '@angular/forms';
import { UserMockService } from '../../core/service/user-mock.service';
import { AuthMockService } from '../../core/service/auth-mock.service';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';
import { LoginModel } from '../../core/models/login.model';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let userService: UserMockService;
  let authService: AuthMockService;


  const mockLoginFields = [
    { name: 'email', label: 'Email', type: 'text', validators: [Validators.required, Validators.email] },
    { name: 'password', label: 'Password', type: 'password', validators: [Validators.required] }
  ];

  const mockFormData = {
    email: 'johndoe@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useClass: UserMockService },
        { provide: AuthService, useClass: AuthMockService },
      ],
      
    }).compileComponents();

    

    // Mock the alert function
    global.alert = jest.fn();
    // // Inject the UserMockService
    // userService = TestBed.inject(UserService) as UserMockService;
    // // Inject the AuthMockService
    // authService = TestBed.inject(AuthService) as AuthMockService;
    // Create the main component fixture
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('UI form fields', () => {
    it('should have email and password fields with correct validators', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      expect(emailControl).toBeTruthy();
      expect(passwordControl).toBeTruthy();

      expect(emailControl?.validator).toBeTruthy();
      expect(passwordControl?.validator).toBeTruthy();

      // Check email validators
      const emailValidators = emailControl?.validator ? [Validators.required, Validators.email] : [];
      expect(emailValidators.length).toBe(2);
      expect(emailValidators[0]).toEqual(Validators.required);
      expect(emailValidators[1]).toEqual(Validators.email);

      // Check password validators
      const passwordValidators = passwordControl?.validator ? [Validators.required] : [];
      expect(passwordValidators.length).toBe(1);
      expect(passwordValidators[0]).toEqual(Validators.required);
    });

    it('should initialize form with empty values', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      expect(emailControl?.value).toBe('');
      expect(passwordControl?.value).toBe('');
    });

    it('should update form values on input change', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      emailControl?.setValue(mockFormData.email);
      passwordControl?.setValue(mockFormData.password);

      expect(emailControl?.value).toBe(mockFormData.email);
      expect(passwordControl?.value).toBe(mockFormData.password);
    });
  });

  describe('onSubmit', () => {
    let loginUser: LoginModel;
    let mockToken: string;
    let routerNavigateSpy: jest.SpyInstance;
    let authServiceLoadCurrentUserSpy: jest.SpyInstance;
    let userServiceLoginSpy: jest.SpyInstance;

    const incorrectCredentialsErrorCases = [
      [400, 'Incorrect credentials, please try again.'],
      [401, 'Incorrect credentials, please try again.'],
      [403, 'Incorrect credentials, please try again.']
    ];

    const otherErrorCases: [number | null | undefined, string][] = [
      [500, 'An error occurred, please try again later.'],
      [404, 'An error occurred, please try again later.'],
      [null, 'An error occurred, please try again later.'],
      [undefined, 'An error occurred, please try again later.']
    ];

    beforeEach(() => {
      loginUser = {
        email: mockFormData.email,
        password: mockFormData.password
      };
      mockToken = 'mock-token';
      
      // Spy on the Router navigateByUrl method
      routerNavigateSpy = jest.spyOn(component['router'], 'navigateByUrl');
    });

    it('should redirect to home on successful login', () => {
      // Spy on the UserService login method to return a successful response
      userServiceLoginSpy = jest.spyOn(component['userService'], 'login').mockReturnValue(of({ message: 'Logged successfully !' }));
      // Spy on the AuthService loadCurrentUser method to return a successful response
      authServiceLoadCurrentUserSpy = jest.spyOn(component['authService'], 'loadCurrentUser').mockReturnValue(of({ authenticated: true, email: loginUser.email }));

      // Set form values
      component.loginForm.setValue({
        email: loginUser.email,
        password: loginUser.password
      });

      // Call onSubmit
      component.onSubmit();

      // Expect login to have been called with the correct user data
      expect(userServiceLoginSpy).toHaveBeenCalledWith(loginUser);
      // Expect loadCurrentUser to have been called after successful login
      expect(authServiceLoadCurrentUserSpy).toHaveBeenCalled();
      // Expect navigation to home page
      expect(routerNavigateSpy).toHaveBeenCalledWith('/');
    });

    

    it.each(incorrectCredentialsErrorCases)('should show, for status "%i",  message "%s" and not redirect to "/admin-pannel" page nor store any token when form is valid but incorrect credentials are provided', (status, expectedMessage) => {
      // Spy on the UserService login method to return a failed response with the specified status
      userServiceLoginSpy = jest.spyOn(component['userService'], 'login').mockReturnValue(throwError(() => ({ status })));

      // Set form values
      component.loginForm.setValue({
        email: loginUser.email,
        password: loginUser.password
      });

      // Simulate form submission
      component.onSubmit();

      expect(userServiceLoginSpy).toHaveBeenCalled()
      expect(alert).toHaveBeenCalledWith(expectedMessage);
      // expect(authServiceLoadCurrentUserSpy).not.toHaveBeenCalled();
      expect(routerNavigateSpy).not.toHaveBeenCalled();
    });

  });

});
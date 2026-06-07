import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { LoginModel } from '../models/login.model';

describe('UserService', () => {
  let userService: UserService;
  let httpMock: HttpTestingController;

  const mockUser: LoginModel = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  describe('login', () => {
    it('should POST to /api/login and return message', () => {
      const mockResponse = { message: 'Logged successfully !' };

      userService.login(mockUser).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should POST to /api/register', () => {
      userService.register(mockUser).subscribe();

      const req = httpMock.expectOne('/api/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);
      req.flush({});
    });
  });

  describe('me', () => {
    it('should GET /api/auth/me and return auth info', () => {
      const mockResponse = { authenticated: true, email: mockUser.email };

      userService.me().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
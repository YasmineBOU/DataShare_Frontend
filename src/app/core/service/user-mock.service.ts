import { Observable, of } from "rxjs";
import { LoginModel } from "../models/login.model";
import { AuthMeModel } from "../models/auth-me.model";

export class UserMockService {

  register(user: LoginModel): Observable<Object> {
    return of();
  }

  // login(user: LoginModel): Observable<{ token: string; message: string }> {
  //   return of({ token: 'mock-token', message: 'Login successful' });
  // }

  login(user: LoginModel): Observable<{ message: string}> {
    return of({ message: 'Login successful' });
  }

  me(): Observable<AuthMeModel> {
    return of({
      authenticated: true,
      email: 'johndoe@example.com'
    });
  }
}
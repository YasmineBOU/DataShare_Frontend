import { Observable, of } from "rxjs";
import { AuthMeModel } from "../models/auth-me.model";

export class AuthMockService {

  getCurrentEmail(): string | null {
    return 'mock-email@mail.com';
  }

  loadCurrentUser(): Observable<AuthMeModel> {
    return of({ authenticated: true, email: 'mock-email@mail.com' });
  }

  logout(): Observable<any> {
    return of();
  }

  isAuthenticated(): boolean {
    return true;
  }
}
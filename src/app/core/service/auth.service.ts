import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { AuthMeModel } from '../models/auth-me.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private readonly apiUrl = '/api';
  private readonly currentEmailSubject = new BehaviorSubject<string | null>(null);

  readonly currentEmail$ = this.currentEmailSubject.asObservable();

  get currentEmail(): string | null {
    return this.currentEmailSubject.value;
  }

  /**
   * Loads the current authenticated user from the backend cookie session.
   * This is the source of truth for auth state when using HttpOnly cookies.
   */
  loadCurrentUser(): Observable<AuthMeModel> {
    return this.httpClient.get<AuthMeModel>(`${this.apiUrl}/auth/me`).pipe(
      tap((response) => {
        this.currentEmailSubject.next(response.authenticated ? response.email : null);
      }),
      catchError((error) => {
        this.currentEmailSubject.next(null);
        return of({ authenticated: false, email: null } as AuthMeModel);
      })
    );
  }

  /**
   * Logout the user by calling the backend logout endpoint.
   * Backend will clear the HttpOnly cookie.
   * 
   * @returns Observable of the logout response
   */
  logout(): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.currentEmailSubject.next(null))
    );
  }

  isAuthenticated(): boolean {
    return this.currentEmailSubject.value !== null;
  }
}

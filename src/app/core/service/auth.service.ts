/**
 * Service responsible for handling user authentication operations.
 * This service interacts with the backend API to manage user registration, login, and logout.
 * It also tracks the currently authenticated user's email using a BehaviorSubject.
 *
 * @see AuthMeModel
 * @see HttpClient
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { AuthMeModel } from '../models/auth-me.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Injected HttpClient for making HTTP requests.
   */
  private httpClient = inject(HttpClient);
  
  /**
   * Base API URL for authentication endpoints.
   */
  private readonly apiUrl = '/api';
  
  /**
   * BehaviorSubject to track the currently authenticated user's email.
   * Emits `null` if no user is authenticated.
   */
  private readonly currentEmailSubject = new BehaviorSubject<string | null>(null);

  /**
   * Observable that emits the currently authenticated user's email.
   * Subscribers can use this to react to authentication state changes.
   */
  readonly currentEmail$ = this.currentEmailSubject.asObservable();

  /**
   * Gets the current authenticated user's email.
   * @returns The email of the authenticated user, or `null` if not authenticated.
   */
  get currentEmail(): string | null {
    return this.currentEmailSubject.value;
  }

  /**
   * Loads the current authenticated user from the backend cookie session.
   * This method queries the `/api/auth/me` endpoint to get the authentication status and email.
   * It updates the `currentEmailSubject` with the result.
   *
   * @returns An {@link Observable} of {@link AuthMeModel} containing the authentication status and email.
   *          If an error occurs, it emits `{ authenticated: false, email: null }`.
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
   * Logs out the user by calling the backend logout endpoint.
   * The backend will clear the HttpOnly cookie, effectively logging out the user.
   * This method also updates the `currentEmailSubject` to `null`.
   *
   * @returns An {@link Observable} of the logout response.
   */
  logout(): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.currentEmailSubject.next(null))
    );
  }

  /**
   * Checks if a user is currently authenticated.
   * @returns `true` if the user is authenticated, `false` otherwise.
   */
  isAuthenticated(): boolean {
    return this.currentEmailSubject.value !== null;
  }
}

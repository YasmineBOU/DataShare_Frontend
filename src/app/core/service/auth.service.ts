import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey: string = 'authToken';
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  
  /**
   * Sets the authentication token in localStorage.
   * 
   * @param token The authentication token to be set.
   */
  setToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string {
    if (!this.isBrowser()) {
      return '';
    }

    return window.localStorage.getItem(this.tokenKey) || '';
  }

/**
 * Removes the token from localStorage.
 * 
 * This method is used to log out the user. It removes the token from localStorage, effectively logging out the user.
 */
  removeToken(): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.removeItem(this.tokenKey);
  }

  /**
   * Checks if the user is authenticated.
   * 
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }
  logout(): void {
    this.removeToken();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // extract expiration time from payload
      const exp = payload.exp;
      if (!exp) {
        return true; 
      }
      // Get current time in seconds
      const now = Math.floor(new Date().getTime() / 1000);
      return exp < now;
    } catch (e) {
      return true; // token invalide
    }
  }
}

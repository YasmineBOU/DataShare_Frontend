/**
 * Service responsible for managing the loading state of the application.
 * This service provides methods to show and hide a loading indicator globally.
 * It uses a BehaviorSubject to track the loading state and exposes it as an Observable
 * for components to react to changes.
 *
 * @see BehaviorSubject
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /**
   * Counter for active requests that require loading indication.
   * This counter helps manage multiple concurrent requests and ensures the loading indicator
   * is only shown when there are active requests.
   */
  private activeRequests = 0;
  
  /**
   * BehaviorSubject that tracks the loading state.
   * Emits `true` when loading starts and `false` when loading ends.
   */
  private isLoading = new BehaviorSubject<boolean>(false);
  
  /**
   * Observable that emits the current loading state.
   * Components can subscribe to this Observable to react to loading state changes.
   */
  isLoading$ = this.isLoading.asObservable();

  /**
   * Timeout reference for showing the loading indicator.
   * Used to delay the display of the loading indicator to avoid flickering for quick requests.
   */
  private showTimeout: any = null;
  
  /**
   * Shows the loading indicator.
   * Sets the loading state to `true`.
   */
  show() {
    this.activeRequests++;
    if (this.activeRequests === 1 && !this.showTimeout) {
      // Do not show the loading indicator immediately to avoid flickering for quick requests.
      this.showTimeout = setTimeout(() => {
        if (this.activeRequests > 0) {
          this.isLoading.next(true);
        }
        this.showTimeout = null;
      }, 300);
    }
  }

  /**
   * Hides the loading indicator.
   * Sets the loading state to `false`.
   */
  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
      this.isLoading.next(false);
    }
  }
}
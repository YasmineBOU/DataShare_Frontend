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
   * Shows the loading indicator.
   * Sets the loading state to `true`.
   */
  show() {
    this.isLoading.next(true);
  }

  /**
   * Hides the loading indicator.
   * Sets the loading state to `false`.
   */
  hide() {
    this.isLoading.next(false);
  }
}

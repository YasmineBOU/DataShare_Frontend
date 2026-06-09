/**
 * Root component of the DataShare Angular application.
 * This component initializes the application, sets up the main layout, and manages authentication state.
 * It uses signals for reactive state management and ensures proper cleanup of stale sessions on startup.
 *
 * @see RouterOutlet
 * @see Header
 * @see AuthService
 * @see isBrowser
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './core/service/auth.service';
import { isBrowser } from './core/utils/common-utils';
import { Header } from './pages/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit{
  /**
   * The application title as a signal for reactive updates.
   * Default value: "DataShare_Frontend".
   */
  protected readonly title = signal('DataShare_Frontend');
  
  /**
   * The AuthService used to manage user authentication state.
   */
  private authService = inject(AuthService);

  /**
   * Initializes the component and manages authentication state cleanup.
   * On browser startup, it clears any stale session and loads the current user state.
   */
  ngOnInit() {
    if (!isBrowser()) {
      return;
    }

    // Clear any stale session on app startup and load current user state
    this.authService.logout().subscribe(() => {
      // After logout, load current user to check if still authenticated via HttpOnly cookie
      this.authService.loadCurrentUser().subscribe();
    });
  }
}

/**
 * Component responsible for rendering the header of the application.
 * This header includes navigation links, user authentication status, and a profile menu.
 * It adapts to mobile and desktop viewports and updates the current route dynamically.
 *
 * @see AuthService
 * @see Router
 * @see isBrowser
 * @see isMobileDevice
 */

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

import { AuthService } from '../../core/service/auth.service';
import { isBrowser, isMobileDevice } from '../../core/utils/common-utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {

  /**
   * The DestroyRef service used to manage subscriptions and avoid memory leaks.
   */
  private destroyRef = inject(DestroyRef);
  
  /**
   * The Router service used to track navigation events and update the current route.
   */
  private router = inject(Router);
  
  /**
   * The AuthService used to access the current user's email and authentication state.
   */
  authService = inject(AuthService);

  /**
   * The current route URL.
   */
  currentRoute: string = '';
  
  /**
   * Flag indicating if the device is mobile.
   */
  isMobile!: boolean;
  
  /**
   * Flag to control the visibility of the profile menu.
   */
  profileMenuOpen: boolean = false;

  /**
   * Observable that emits the current user's email.
   */
  currentEmail$ = this.authService.currentEmail$;
  
  /**
   * Observable that emits a boolean indicating if the user is authenticated.
   * It starts with the current authentication state and updates dynamically.
   */
  readonly isAuthenticated$ = this.currentEmail$.pipe(
    map((email) => email !== null),
    startWith(this.authService.isAuthenticated()),
    distinctUntilChanged(),
  );

  /**
   * Initializes the component and sets up responsive behavior and route tracking.
   * Checks if the device is mobile and subscribes to router events to update the current route.
   */
  ngOnInit() {
    if (!isBrowser()) {
      return;
    }
    this.isMobile = isMobileDevice(window.innerWidth);
    this.updateCurrentRoute(this.router.url);

    // Listener for route changes to update currentRoute
    this.router.events.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateCurrentRoute(event.urlAfterRedirects);
    });
  }

  /**
   * Determines if the current route is the upload page or the home page.
   *
   * @returns `true` if the current route is the upload page or home page, `false` otherwise.
   */
  get isUploadPage(): boolean {
    return this.currentRoute === '/' || this.currentRoute.startsWith('/files/upload');
  }

  /**
   * Determines if the current route is the download page.
   *
   * @returns `true` if the current route is the download page, `false` otherwise.
   */
  get isDownloadPage(): boolean {
    return this.currentRoute.startsWith('/files/download');
  }

  /**
   * Determines if the current route is the dashboard page.
   *
   * @returns `true` if the current route is the dashboard page, `false` otherwise.
   */
  get isDashboardPage(): boolean {
    return this.currentRoute.startsWith('/dashboard');
  }

  /**
   * Updates the current route URL by removing query parameters and fragments.
   *
   * @param url - The current route URL.
   */
  private updateCurrentRoute(url: string): void {
    this.currentRoute = url.split('?')[0].split('#')[0];
  }

  /**
   * Logs out the current user and navigates to the login page.
   */
  logout() {
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Logout failed', error);
        alert('Logout failed. Please try again.');
      }
    );
  }

  /**
   * Toggles the visibility of the profile menu.
   */
  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }
}

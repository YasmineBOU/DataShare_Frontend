/**
 * Component responsible for rendering the sidebar in the dashboard layout.
 * This sidebar provides navigation links and is designed to work responsively on both mobile and desktop devices.
 * It automatically closes on mobile devices when navigating to a new route.
 *
 * @see Router
 * @see isBrowser
 * @see isMobileDevice
 * @see watchViewportWidth
 * @see takeUntilDestroyed
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { isBrowser, isMobileDevice, watchViewportWidth } from '../../core/utils/common-utils';

/**
 * Component that renders the dashboard sidebar.
 * It provides navigation functionality and adapts to mobile or desktop viewports.
 */
@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebar implements OnInit {
  /**
   * The current year, used for the footer copyright.
   */
  year = new Date().getFullYear();
  
  /**
   * Flag to control the visibility of the sidebar.
   * On mobile devices, the sidebar can be toggled open or closed.
   */
  isSidebarOpen = false;
  
  /**
   * Flag to determine if the device is mobile.
   * Used to adapt the sidebar behavior for mobile users.
   */
  isMobile = false;

  /**
   * The Angular Router service, used to track navigation events.
   */
  private router = inject(Router);
  
  /**
   * The DestroyRef service, used to manage subscriptions and avoid memory leaks.
   */
  private destroyRef = inject(DestroyRef);

  /**
   * Initializes the component and sets up responsive behavior.
   * Checks if the device is mobile, watches viewport width changes, and closes the sidebar on mobile when navigating.
   */
  ngOnInit() {
    if (!isBrowser()) {
      return;
    }

    this.checkIfMobile();
    watchViewportWidth().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.checkIfMobile());

    // Fermer sidebar sur navigation mobile
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationEnd && this.isMobile) {
        this.isSidebarOpen = false;
      }
    });
  }

  /**
   * Toggles the sidebar open or closed.
   * Used for mobile viewports where the sidebar can be expanded or collapsed.
   */
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Checks if the device is mobile and updates the sidebar state accordingly.
   * On mobile devices, the sidebar is closed by default. On desktop, it is open.
   */
  private checkIfMobile() {
    this.isMobile = isMobileDevice(window.innerWidth);
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    }
  }
}

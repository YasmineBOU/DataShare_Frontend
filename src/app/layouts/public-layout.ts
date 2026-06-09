/**
 * Component responsible for rendering the public layout of the application.
 * This layout is used for pages accessible to all users, such as login, registration, and file download pages.
 * It dynamically hides the footer for routes starting with '/dashboard' (e.g., authenticated user pages).
 *
 * @see Router
 * @see NavigationEnd
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

/**
 * Component that renders the public layout of the application.
 * It includes a router outlet for displaying routed content and dynamically controls the footer visibility.
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss'],
})
export class PublicLayout {
  /**
   * The current year, used for the footer copyright.
   */
  year = new Date().getFullYear();
  
  /**
   * Flag to control the visibility of the footer.
   * The footer is hidden for routes starting with '/dashboard'.
   */
  showFooter = true;

  /**
   * Constructs a new PublicLayout component.
   * Subscribes to router events to dynamically update the footer visibility based on the current route.
   *
   * @param router - The Angular Router service used to track navigation events.
   */
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showFooter = !event.url.startsWith('/dashboard');
      }
    });
  }
}

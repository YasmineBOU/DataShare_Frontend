/**
 * Component responsible for rendering the main dashboard layout.
 * This layout includes a sidebar for navigation and a router outlet for displaying routed content.
 * It is used as the primary layout for authenticated users.
 *
 * @see DashboardSidebar
 * @see RouterOutlet
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';

/**
 * Component that renders the main dashboard layout.
 * It includes a sidebar for navigation and a router outlet to display routed content.
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet,
    DashboardSidebar
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}

import { Component } from '@angular/core';
import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { RouterOutlet } from '@angular/router';

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

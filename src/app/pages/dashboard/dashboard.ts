import { Component } from '@angular/core';
import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { FileListing } from '../file-listing/file-listing';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    FileListing,
    RouterOutlet,
    DashboardSidebar
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}

import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  year = new Date().getFullYear();
  showFooter = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showFooter = !event.url.startsWith('/dashboard');
      }
    });
  }
}

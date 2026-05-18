import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './pages/header/header';
import { AuthService } from './core/service/auth.service';
import { isBrowser } from './core/utils/common-utils';

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
  protected readonly title = signal('DataShare_Frontend');
  private authService = inject(AuthService);

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

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

    this.authService.logout().pipe().subscribe(() => {
      },
      (error) => {
        console.error('Logout failed', error);
      }
    );
  }
}

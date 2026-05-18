// header.component.ts
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { isBrowser, isMobileDevice } from '../../core/utils/common-utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {

  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  authService = inject(AuthService);

  currentEmail$ = this.authService.currentEmail$;
  readonly isAuthenticated$ = this.currentEmail$.pipe(
    map((email) => email !== null),
    startWith(this.authService.isAuthenticated()),
    distinctUntilChanged(),
  );
  currentRoute: string = '';
  isMobile!: boolean;
  profileMenuOpen: boolean = false;

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

  get isUploadPage(): boolean {
    return this.currentRoute === '/' || this.currentRoute.startsWith('/files/upload');
  }

   get isDownloadPage(): boolean {
    return this.currentRoute.startsWith('/files/download');
  }

  get isDashboardPage(): boolean {
    return this.currentRoute.startsWith('/dashboard');
  }

  private updateCurrentRoute(url: string): void {
    this.currentRoute = url.split('?')[0].split('#')[0];
  }

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

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }
}

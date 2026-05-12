// header.component.ts
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

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
  isAuthenticated: boolean = false;
  currentRoute: string = '';

  ngOnInit() {
    this.updateCurrentRoute(this.router.url);

    // Écoute les changements de route
    this.router.events.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateCurrentRoute(event.urlAfterRedirects);
    });

    // Charge l'état de l'utilisateur et met à jour isAuthenticated
    this.authService.loadCurrentUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isAuthenticated = this.authService.isAuthenticated();
    });

    // Écoute les changements d'authentification
    this.currentEmail$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((email) => {
      this.isAuthenticated = email !== null;
    });
  }

  get isUploadPage(): boolean {
    return this.currentRoute === '/' || this.currentRoute.startsWith('/files/upload');
  }

  get isDashboardPage(): boolean {
    return this.currentRoute.startsWith('/dashboard');
  }

  get showDashboardHeader(): boolean {
    return this.isAuthenticated && this.isDashboardPage;
  }

  get showUploadHeader(): boolean {
    return this.isAuthenticated && this.isUploadPage;
  }

  private updateCurrentRoute(url: string): void {
    this.currentRoute = url.split('?')[0].split('#')[0];
  }

  logout() {
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
    },
    (error) => {
      console.error('Logout failed', error);
      alert('Logout failed. Please try again.');
    }
  );
  }
}

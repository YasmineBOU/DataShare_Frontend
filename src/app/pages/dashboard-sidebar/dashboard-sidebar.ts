import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isBrowser, isMobileDevice, watchViewportWidth } from '../../core/utils/common-utils';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebar implements OnInit {
  year = new Date().getFullYear();
  isSidebarOpen = false;
  isMobile = false;

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

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

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private checkIfMobile() {
    this.isMobile = isMobileDevice(window.innerWidth);
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    }
  }
}

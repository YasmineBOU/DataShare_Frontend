import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebar implements OnInit {
  isSidebarOpen = false;
  isMobile = false;

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());

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
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    }
  }
}

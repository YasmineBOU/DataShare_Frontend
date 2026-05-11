// header.component.ts
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
  isAuthenticated = false;
  currentEmail: string | null = null;
  authService = inject(AuthService); 
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.authService.loadCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.isAuthenticated = response.authenticated;
        this.currentEmail = response.email;
      });
    
  }
}

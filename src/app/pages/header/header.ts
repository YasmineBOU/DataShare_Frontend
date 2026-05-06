// header.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  isAuthenticated = false;
  authService = inject(AuthService); 

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    
  }
}

// header.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  authService = inject(AuthService); 

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log("Header component initialized. User authenticated: ", this.isAuthenticated);
    
  }
}

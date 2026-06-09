/**
 * Component responsible for rendering the login form and handling user authentication.
 * This component allows users to log in by providing their email and password.
 * It integrates with the backend API to validate credentials and update the authentication state.
 *
 * @see UserService
 * @see AuthService
 * @see LoginModel
 */

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LoginModel } from '../../core/models/login.model';
import { AuthService } from '../../core/service/auth.service';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login{

  /**
   * Reactive form for handling user login inputs (email and password).
   */
  loginForm: FormGroup;
  
  /**
   * The UserService used to interact with the backend API for login operations.
   */
  private userService = inject(UserService);
  
  /**
   * The AuthService used to load the current user's profile after a successful login.
   */
  private authService = inject(AuthService);
  
  /**
   * The DestroyRef service used to manage subscriptions and avoid memory leaks.
   */
  private destroyRef = inject(DestroyRef);
  
  /**
   * The Router service used to navigate to other pages after login.
   */
  private router = inject(Router);

  /**
   * Constructs a new Login component and initializes the login form.
   * The form includes validation for email and password fields.
   *
   * @param formBuilder - The FormBuilder service used to create the reactive form.
   */
  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  

  /**
   * Handles the form submission for user login.
   * Validates the form, sends the login request to the backend, and updates the authentication state.
   * Navigates to the home page after a successful login.
   */
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched()
      return;
    }

    const loginUser: LoginModel = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.userService.login(loginUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response.message);
          this.authService.loadCurrentUser()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => this.router.navigateByUrl('/'),
              error: () => this.router.navigateByUrl('/')
            });
        },
        error: (err) => {
          if (err.status == 401) {
            alert('Incorrect credentials, please try again.');
          } else {
            alert('An error occurred, please try again later.');
          }
        }
      });
  }
}

/**
 * Component responsible for rendering the registration form and handling new user signups.
 * This component allows users to create a new account by providing their email, password, and password confirmation.
 * It integrates with the backend API to register the user and validates inputs using configuration constants.
 *
 * @see UserService
 * @see LoginModel
 * @see RegisterModel
 * @see REGISTER_CONFIG
 */

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { REGISTER_CONFIG } from '../../core/config/config';
import { LoginModel } from '../../core/models/login.model';
import { RegisterModel } from '../../core/models/register.model';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  
  /**
   * Reactive form for handling user registration inputs (email, password, and confirmPassword).
   */
  registerForm: FormGroup;
  
  /**
   * The UserService used to interact with the backend API for registration operations.
   */
  private userService = inject(UserService);
  
  /**
   * The DestroyRef service used to manage subscriptions and avoid memory leaks.
   */
  private destroyRef = inject(DestroyRef);
  
  /**
   * The Router service used to navigate to other pages after registration.
   */
  private router = inject(Router);
  
  /**
   * The minimum password length required for registration, sourced from {@link REGISTER_CONFIG}.
   */
  passwordMinLength = REGISTER_CONFIG.PASSWORD_MIN_LENGTH;

  /**
   * Constructs a new Register component and initializes the registration form.
   * The form includes validation for email, password, and confirmPassword fields.
   *
   * @param formBuilder - The FormBuilder service used to create the reactive form.
   */
  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      email: [
        '', 
        [
          Validators.required, 
          Validators.pattern(REGISTER_CONFIG.EMAIL_REGEX)
        ]
      ],
      password: [
        '', 
        [
          Validators.required, 
          Validators.minLength(this.passwordMinLength),
          Validators.pattern(REGISTER_CONFIG.PASSWORD_REGEX)
        ]
      ],
      confirmPassword: [
        '', 
        Validators.required
      ]
    });
  }
  

  /**
   * Handles the form submission for user registration.
   * Validates the form inputs, checks password matching, sends the registration request to the backend,
   * and navigates to the login page after a successful registration.
   */
  onSubmit() {

    const registerUser: RegisterModel = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword
    };

    if (!this.registerForm.valid) {
      if (this.registerForm.controls['email'].invalid) {
        alert('Veuillez entrer une adresse e-mail valide.');
      } 
      else {
        alert('Veuillez remplir tous les champs requis.');
      }
      return;
    }

    if (registerUser.password !== registerUser.confirmPassword) {
      alert('Les mots de passe ne correspondent pas, Veuillez réessayer.');
      return;
    }

    let newUser: LoginModel = {
      email: registerUser.email,
      password: registerUser.password
    };
    this.userService.register(newUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          alert('Compte créé avec succès, vous pouvez maintenant vous connecter.');
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          if (err.status === 409) {
            alert('Un compte avec cette adresse e-mail existe déjà. Veuillez utiliser une autre adresse e-mail.');
          } else {
            console.error('Error during registration:', err);
            alert('Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.');
          }
        }
      });
  }
}

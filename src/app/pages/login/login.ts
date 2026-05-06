import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LoginModel } from '../../core/models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login{

  loginForm: FormGroup;
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  // private authService = inject(AuthService);

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  

  onSubmit() {

    const loginUser: LoginModel = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.userService.login(loginUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          //this.router.navigateByUrl('/admin-pannel');
          console.log('Login successful, token:', response.token);
        },
        error: (err) => {
          if ([400, 401, 403].includes(err.status)) {
            alert('Incorrect credentials, please try again.');
          } else {
            alert('An error occurred, please try again later.');
          }
        }
      });
  }
}

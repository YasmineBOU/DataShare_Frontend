import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { LoginModel } from '../../core/models/login.model';
import { RegisterModel } from '../../core/models/register.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  
  registerForm: FormGroup;
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private passwordLength = 8;

  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(this.passwordLength)]],
      confirmPassword: ['', Validators.required]
    });
  }
  

  onSubmit() {

    const registerUser: RegisterModel = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword
    };

    if (!this.registerForm.valid) {
      if (this.registerForm.controls['email'].invalid) {
        alert('Veuillez entrer une adresse e-mail valide.');
      } else if (this.registerForm.controls['password'].invalid) {
        alert(`Le mot de passe doit comporter au moins ${this.passwordLength} caractères.`);
      } else {
        alert('Veuillez remplir tous les champs requis.');
      }
      return;
    }

    if (registerUser.password !== registerUser.confirmPassword) {
      alert('Les mot de passe ne correspondent pas, Veuillez réessayer.');
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
          alert('Something went wrong : ' + err.message);
        }
      });
  }
}

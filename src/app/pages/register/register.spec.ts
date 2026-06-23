import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginModel } from '../../core/models/login.model';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  
  const mockFormData = {
    email: 'johndoe@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'  
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([])],
    }).compileComponents();

    // Mock the alert function
    global.alert = jest.fn();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('UI form fields', () => {

    const invalidPasswordFormat: string[] = [
      "short",
      "nouppercase1!",
      "NOLOWERCASE1!",
      "NoNumber!",
      "NoSpecialChar1"
    ];
    
    it('should be invalid when email is empty', () => {
      component.registerForm.get('email')?.setValue('');
      expect(component.registerForm.get('email')?.hasError('required')).toBe(true);
    });

    it('should be invalid when email format is wrong', () => {
      component.registerForm.get('email')?.setValue('notanemail');
      expect(component.registerForm.get('email')?.hasError('pattern')).toBe(true);
    });

    it('should be invalid when password is empty', () => {
      component.registerForm.get('password')?.setValue('');
      expect(component.registerForm.get('password')?.hasError('required')).toBe(true);
    });

    it.each(invalidPasswordFormat)('should be invalid when password format is not respected: "%s"', (password) => {
      component.registerForm.get('password')?.setValue(password);
      expect(component.registerForm.get('password')?.hasError('pattern')).toBe(true);
    });

    it('should be invalid when password length is not respected', () => {
      component.registerForm.get('password')?.setValue('Pass1!');
      expect(component.registerForm.get('password')?.hasError('minlength')).toBe(true);
    });

    it('should be invalid when confirmPassword does not match password', () => {
      component.registerForm.get('password')?.setValue(mockFormData.password);
      component.registerForm.get('confirmPassword')?.setValue('differentPassword');
      expect(component.registerForm.get('confirmPassword')?.value).not.toBe(component.registerForm.get('password')?.value);
    });

    it('should initialize form with empty values', () => {
      const emailControl = component.registerForm.get('email');
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl = component.registerForm.get('confirmPassword');

      expect(emailControl?.value).toBe('');
      expect(passwordControl?.value).toBe('');
      expect(confirmPasswordControl?.value).toBe('');
    });

    it('should update form values on input change', () => {
      const emailControl = component.registerForm.get('email');
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl = component.registerForm.get('confirmPassword');

      emailControl?.setValue(mockFormData.email);
      passwordControl?.setValue(mockFormData.password);
      confirmPasswordControl?.setValue(mockFormData.confirmPassword);

      expect(emailControl?.value).toBe(mockFormData.email);
      expect(passwordControl?.value).toBe(mockFormData.password);
      expect(confirmPasswordControl?.value).toBe(mockFormData.confirmPassword);
    });
  });

  describe('onSubmit', () => {
    let newUser: LoginModel;
    let routerNavigateSpy: jest.SpyInstance;
    let userServiceRegisterSpy: jest.SpyInstance;

    beforeEach(() => {
      newUser = {
        email: mockFormData.email,
        password: mockFormData.password
      };
      
      // Spy on the Router navigateByUrl method
      routerNavigateSpy = jest.spyOn(component['router'], 'navigateByUrl').mockResolvedValue(true);
    });

    it('should not register user nor redirect to "/" given invalid email ', () => {
      component.registerForm.get('email')?.setValue('anyemail@example');

      component.onSubmit();

      expect(global.alert).toHaveBeenCalledWith('Veuillez entrer une adresse e-mail valide.');
     });

    it('should not register user nor redirect to "/" given invalid form data ', () => {
      component.registerForm.get('email')?.setValue(mockFormData.email);
      component.registerForm.get('password')?.setValue('');
      component.registerForm.get('confirmPassword')?.setValue('');

      component.onSubmit();

      expect(global.alert).toHaveBeenCalledWith('Veuillez remplir tous les champs requis.');
     });

    it('should not register user nor redirect to "/" given password mismatch ', () => {
      component.registerForm.get('email')?.setValue(mockFormData.email);
      component.registerForm.get('password')?.setValue('Password1!');
      component.registerForm.get('confirmPassword')?.setValue('DifferentPassword1!');

      component.onSubmit();

      expect(global.alert).toHaveBeenCalledWith('Les mots de passe ne correspondent pas, Veuillez réessayer.');
     });

     it('should register user and redirect to "/login" given valid form data ', () => {
      userServiceRegisterSpy = jest.spyOn(component['userService'], 'register').mockReturnValue(of({}));
      
      component.registerForm.setValue({
        email: mockFormData.email,
        password: mockFormData.password,
        confirmPassword: mockFormData.confirmPassword
      });

      component.onSubmit();

      expect(userServiceRegisterSpy).toHaveBeenCalledWith(newUser);
      expect(global.alert).toHaveBeenCalledWith('Compte créé avec succès, vous pouvez maintenant vous connecter.');
      expect(routerNavigateSpy).toHaveBeenCalledWith('/login');
     });

     it('should not register user nor redirect to "/login" when unknown error raised from server ', () => {
      let errorMessage = 'Unknown error';
      userServiceRegisterSpy = jest.spyOn(component['userService'], 'register').mockReturnValue(throwError(() => ({ message: errorMessage })));
      
      component.registerForm.setValue({
        email: mockFormData.email,
        password: mockFormData.password,
        confirmPassword: mockFormData.confirmPassword
      });

      component.onSubmit();

      expect(userServiceRegisterSpy).toHaveBeenCalledWith(newUser);
      expect(global.alert).toHaveBeenCalledWith('Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.');
      expect(routerNavigateSpy).not.toHaveBeenCalledWith('/login');
     });
  });
});

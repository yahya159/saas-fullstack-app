import { Component, OnInit, signal, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      rememberMe: new FormControl(false)
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      try {
        const { email, password, rememberMe } = this.loginForm.value;

        const result = await this.authService.login(email, password, rememberMe);

        if (result.success) {
          // Navigate to dashboard or intended route
          const returnUrl = this.getReturnUrl();
          await this.router.navigate([returnUrl]);
        } else {
          this.errorMessage.set(result.error || 'Login failed. Please try again.');
        }
      } catch (error) {
        this.errorMessage.set('An unexpected error occurred. Please try again.');
        console.error('Login error:', error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private getReturnUrl(): string {
    // Check if there's a return URL in query params
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnUrl') || '/dashboard';
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  async loginWithGoogle() {
    this.isLoading.set(true);
    try {
      await this.authService.loginWithGoogle();
      const returnUrl = this.getReturnUrl();
      await this.router.navigate([returnUrl]);
    } catch (error) {
      this.errorMessage.set('Google login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithMicrosoft() {
    this.isLoading.set(true);
    try {
      await this.authService.loginWithMicrosoft();
      const returnUrl = this.getReturnUrl();
      await this.router.navigate([returnUrl]);
    } catch (error) {
      this.errorMessage.set('Microsoft login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

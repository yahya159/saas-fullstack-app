import { Component, ElementRef, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SignupService, ApiError } from 'src/app/@api/services/signup/signup.service';
import { UserSignUPDTO } from '../dto/user-signup.dto';
import { NotificationService } from '../../../@core/services/notification.service';
import { LoadingService } from '../../../@core/services/loading.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SignupComponent implements OnInit {
  myForm!: FormGroup;
  invalidFields: Record<string, boolean> = {};
  readonly isLoading = signal(false);
  readonly formErrors = signal<Record<string, string>>({});
  
  private signupService = inject(SignupService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private el = inject(ElementRef);

  ngOnInit() {
    this.initializeForm();
    this.setupFormValidation();
  }

  private initializeForm(): void {
    this.myForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9_\\s\'-]+$')
      ]),
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')
      ]),
      streetAddr: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]),
      streetAddr2: new FormControl('', [
        Validators.maxLength(100)
      ]),
      city: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      state: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      zipCode: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{5}(-[0-9]{4})?$')
      ]),
    });
  }

  private setupFormValidation(): void {
    this.myForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.updateValidationState();
    });
  }

  onFormSubmit(form: FormGroup): void {
    if (form.valid) {
      this.submitForm(form.value);
    } else {
      this.handleFormValidationErrors();
    }
  }

  private async submitForm(formData: any): Promise<void> {
    this.isLoading.set(true);
    this.loadingService.setLoading('signup', true);

    const userSignUPDTO: UserSignUPDTO = {
      username: formData.username,
      firstName: formData.firstname,
      lastName: formData.lastname,
      email: formData.email,
      phoneNumber: formData.phone,
      streetAddress: formData.streetAddr,
      streetAddressTwo: formData.streetAddr2 || '',
      city: formData.city,
      state: formData.state,
      zipCode: Number(formData.zipCode),
      password: this.generateTemporaryPassword(),
      plan: "YZ-PLAN-1"
    };

    try {
      const response = await this.signupService.signup(userSignUPDTO).toPromise();
      
      this.notificationService.success(
        'Account Created!',
        'Your account has been created successfully. Please check your email for verification instructions.'
      );
      
      // Redirect to dashboard or next step
      this.router.navigate(['/dashboard']);
      
    } catch (error) {
      this.handleSignupError(error as ApiError);
    } finally {
      this.isLoading.set(false);
      this.loadingService.setLoading('signup', false);
    }
  }

  private handleSignupError(error: ApiError): void {
    console.error('Signup error:', error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    switch (error.code) {
      case 'EMAIL_EXISTS':
        errorMessage = 'An account with this email already exists.';
        break;
      case 'USERNAME_EXISTS':
        errorMessage = 'This username is already taken. Please choose another.';
        break;
      case 'INVALID_EMAIL':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'VALIDATION_ERROR':
        errorMessage = 'Please check your form data and try again.';
        break;
      case 'NETWORK_ERROR':
        errorMessage = 'Network error. Please check your connection and try again.';
        break;
    }
    
    this.notificationService.error('Signup Failed', errorMessage);
  }

  private handleFormValidationErrors(): void {
    const errors: Record<string, string> = {};
    
    Object.keys(this.myForm.controls).forEach(controlName => {
      const control = this.myForm.get(controlName);
      if (control && control.invalid && control.errors) {
        errors[controlName] = this.getFieldErrorMessage(controlName, control.errors);
      }
    });
    
    this.formErrors.set(errors);
    this.updateValidationState();
    
    this.notificationService.warning(
      'Form Validation Error',
      'Please correct the highlighted fields and try again.'
    );
  }

  private getFieldErrorMessage(fieldName: string, errors: any): string {
    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required.`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `${this.getFieldDisplayName(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters.`;
    }
    if (errors['pattern']) {
      return `${this.getFieldDisplayName(fieldName)} format is invalid.`;
    }
    return `${this.getFieldDisplayName(fieldName)} is invalid.`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      username: 'Username',
      firstname: 'First Name',
      lastname: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      streetAddr: 'Street Address',
      streetAddr2: 'Street Address Line 2',
      city: 'City',
      state: 'State',
      zipCode: 'Zip Code'
    };
    return displayNames[fieldName] || fieldName;
  }

  private updateValidationState(): void {
    const newInvalidFields: Record<string, boolean> = {};
    
    Object.keys(this.myForm.controls).forEach(controlName => {
      const control = this.myForm.get(controlName);
      if (control && control.invalid && control.touched) {
        newInvalidFields[controlName] = true;
      }
    });
    
    this.invalidFields = newInvalidFields;
  }

  private generateTemporaryPassword(): string {
    // In a real app, this should be handled by the backend
    // or the user should set their own password
    return 'TempPassword123!';
  }

  getFieldError(fieldName: string): string {
    return this.formErrors()[fieldName] || '';
  }
}

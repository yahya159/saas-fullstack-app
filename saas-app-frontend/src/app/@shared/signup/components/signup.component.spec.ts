import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignupComponent } from './signup.component';
import { SignupService, ApiError } from '../../../@api/services/signup/signup.service';
import { NotificationService } from '../../../@core/services/notification.service';
import { LoadingService } from '../../../@core/services/loading.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockSignupService: jasmine.SpyObj<SignupService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const signupServiceSpy = jasmine.createSpyObj('SignupService', ['signup']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'warning']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['setLoading']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule],
      providers: [
        { provide: SignupService, useValue: signupServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    mockSignupService = TestBed.inject(SignupService) as jasmine.SpyObj<SignupService>;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockLoadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.myForm.get('username')?.value).toBe('');
    expect(component.myForm.get('email')?.value).toBe('');
    expect(component.myForm.get('firstname')?.value).toBe('');
    expect(component.myForm.get('lastname')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const usernameControl = component.myForm.get('username');
    const emailControl = component.myForm.get('email');

    expect(usernameControl?.hasError('required')).toBeTruthy();
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.myForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate username pattern', () => {
    const usernameControl = component.myForm.get('username');
    
    usernameControl?.setValue('user@123');
    expect(usernameControl?.hasError('pattern')).toBeTruthy();

    usernameControl?.setValue('valid_username');
    expect(usernameControl?.hasError('pattern')).toBeFalsy();
  });

  it('should validate minimum length for names', () => {
    const firstnameControl = component.myForm.get('firstname');
    
    firstnameControl?.setValue('A');
    expect(firstnameControl?.hasError('minlength')).toBeTruthy();

    firstnameControl?.setValue('John');
    expect(firstnameControl?.hasError('minlength')).toBeFalsy();
  });

  it('should validate zip code pattern', () => {
    const zipCodeControl = component.myForm.get('zipCode');
    
    zipCodeControl?.setValue('123');
    expect(zipCodeControl?.hasError('pattern')).toBeTruthy();

    zipCodeControl?.setValue('12345');
    expect(zipCodeControl?.hasError('pattern')).toBeFalsy();

    zipCodeControl?.setValue('12345-6789');
    expect(zipCodeControl?.hasError('pattern')).toBeFalsy();
  });

  it('should submit form successfully', async () => {
    const mockResponse = { success: true, message: 'Account created successfully' };
    mockSignupService.signup.and.returnValue(of(mockResponse));

    component.myForm.patchValue({
      username: 'testuser',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      streetAddr: '123 Main St',
      streetAddr2: 'Apt 1',
      city: 'New York',
      state: 'NY',
      zipCode: '12345'
    });

    await component.onFormSubmit(component.myForm);

    expect(mockSignupService.signup).toHaveBeenCalled();
    expect(mockNotificationService.success).toHaveBeenCalledWith(
      'Account Created!',
      'Your account has been created successfully. Please check your email for verification instructions.'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle signup error', async () => {
    const mockError: ApiError = {
      message: 'Email already exists',
      code: 'EMAIL_EXISTS'
    };
    mockSignupService.signup.and.returnValue(throwError(() => mockError));

    component.myForm.patchValue({
      username: 'testuser',
      firstname: 'John',
      lastname: 'Doe',
      email: 'existing@example.com',
      phone: '1234567890',
      streetAddr: '123 Main St',
      streetAddr2: 'Apt 1',
      city: 'New York',
      state: 'NY',
      zipCode: '12345'
    });

    await component.onFormSubmit(component.myForm);

    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'Signup Failed',
      'An account with this email already exists.'
    );
  });

  it('should handle form validation errors', () => {
    component.myForm.patchValue({
      username: '',
      email: 'invalid-email'
    });

    component.onFormSubmit(component.myForm);

    expect(mockNotificationService.warning).toHaveBeenCalledWith(
      'Form Validation Error',
      'Please correct the highlighted fields and try again.'
    );
  });

  it('should show loading state during submission', async () => {
    const mockResponse = { success: true, message: 'Account created successfully' };
    mockSignupService.signup.and.returnValue(of(mockResponse));

    component.myForm.patchValue({
      username: 'testuser',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      streetAddr: '123 Main St',
      streetAddr2: 'Apt 1',
      city: 'New York',
      state: 'NY',
      zipCode: '12345'
    });

    const submitPromise = component.onFormSubmit(component.myForm);
    
    expect(component.isLoading()).toBeTruthy();
    expect(mockLoadingService.setLoading).toHaveBeenCalledWith('signup', true);

    await submitPromise;

    expect(component.isLoading()).toBeFalsy();
    expect(mockLoadingService.setLoading).toHaveBeenCalledWith('signup', false);
  });

  it('should get field error message', () => {
    const usernameControl = component.myForm.get('username');
    usernameControl?.setValue('');
    usernameControl?.markAsTouched();

    component.updateValidationState();
    const errorMessage = component.getFieldError('username');

    expect(errorMessage).toContain('Username is required');
  });

  it('should handle different error codes', async () => {
    const testCases = [
      { code: 'USERNAME_EXISTS', expectedMessage: 'This username is already taken. Please choose another.' },
      { code: 'INVALID_EMAIL', expectedMessage: 'Please enter a valid email address.' },
      { code: 'VALIDATION_ERROR', expectedMessage: 'Please check your form data and try again.' },
      { code: 'NETWORK_ERROR', expectedMessage: 'Network error. Please check your connection and try again.' },
      { code: 'UNKNOWN_ERROR', expectedMessage: 'An unexpected error occurred. Please try again.' }
    ];

    for (const testCase of testCases) {
      const mockError: ApiError = {
        message: 'Test error',
        code: testCase.code
      };
      mockSignupService.signup.and.returnValue(throwError(() => mockError));

      component.myForm.patchValue({
        username: 'testuser',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        streetAddr: '123 Main St',
        streetAddr2: 'Apt 1',
        city: 'New York',
        state: 'NY',
        zipCode: '12345'
      });

      await component.onFormSubmit(component.myForm);

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Signup Failed',
        testCase.expectedMessage
      );
    }
  });
});

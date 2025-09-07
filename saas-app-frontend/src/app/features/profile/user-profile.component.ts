import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'fr';
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  currency: 'USD' | 'EUR' | 'GBP';
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  trustedDevices: TrustedDevice[];
}

interface TrustedDevice {
  id: string;
  name: string;
  browser: string;
  os: string;
  lastUsed: Date;
  location: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);

  // Signals for reactive state management
  currentUser = this.authService.currentUser;
  activeTab = signal<'profile' | 'preferences' | 'security' | 'billing'>('profile');
  isLoading = signal(false);
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Form groups
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;

  // Data signals
  userPreferences = signal<UserPreferences>({
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  securitySettings = signal<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    trustedDevices: []
  });

  // Computed values
  userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  });

  roleDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';

    const roleMap: Record<string, string> = {
      'CUSTOMER_ADMIN': 'Administrateur Technique',
      'CUSTOMER_MANAGER': 'Gestionnaire Produit',
      'CUSTOMER_DEVELOPER': 'Développeur',
      'SAAS_ADMIN': 'Administrateur Plateforme',
      'SAAS_MANAGER': 'Gestionnaire Plateforme'
    };

    return roleMap[user.role] || user.role;
  });

  // Available options
  timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (Central European Time)' },
    { value: 'America/New_York', label: 'America/New_York (Eastern Time)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan Standard Time)' }
  ];

  currencies = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];

  // Password validator
  private passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  };

  ngOnInit() {
    this.initializeForms();
    this.loadUserData();
  }

  private initializeForms() {
    const user = this.currentUser();

    this.profileForm = new FormGroup({
      firstName: new FormControl(user?.firstName || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      ]),
      lastName: new FormControl(user?.lastName || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      ]),
      email: new FormControl(user?.email || '', [
        Validators.required,
        Validators.email
      ]),
      phone: new FormControl('', [
        Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)
      ]),
      company: new FormControl(''),
      jobTitle: new FormControl(''),
      bio: new FormControl('', [Validators.maxLength(500)])
    });

    this.preferencesForm = new FormGroup({
      theme: new FormControl(this.userPreferences().theme),
      language: new FormControl(this.userPreferences().language),
      emailNotifications: new FormControl(this.userPreferences().emailNotifications),
      pushNotifications: new FormControl(this.userPreferences().pushNotifications),
      marketingEmails: new FormControl(this.userPreferences().marketingEmails),
      weeklyReports: new FormControl(this.userPreferences().weeklyReports),
      timezone: new FormControl(this.userPreferences().timezone),
      dateFormat: new FormControl(this.userPreferences().dateFormat),
      currency: new FormControl(this.userPreferences().currency)
    });

    this.securityForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]),
      confirmPassword: new FormControl('')
    });

    // Add password confirmation validator
    this.securityForm.setValidators(this.passwordMatchValidator);
  }

  public async loadUserData() {
    this.isLoading.set(true);
    try {
      const [preferences, security] = await Promise.all([
        this.userProfileService.getUserPreferences() as Promise<UserPreferences>,
        this.userProfileService.getSecuritySettings() as Promise<SecuritySettings>
      ]);

      if (preferences) {
        this.userPreferences.set(preferences);
        this.preferencesForm.patchValue(preferences);
      }

      if (security) {
        this.securitySettings.set(security);
      }
    } catch (error) {
      this.errorMessage.set('Failed to load user data');
      console.error('Error loading user data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setActiveTab(tab: 'profile' | 'preferences' | 'security' | 'billing') {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  async onProfileSubmit() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);
      try {
        await (this.userProfileService.updateProfile(this.profileForm.value) as Promise<void>);
        this.successMessage.set('Profile updated successfully');
      } catch (error) {
        this.errorMessage.set('Failed to update profile');
      } finally {
        this.isSaving.set(false);
      }
    }
  }

  async onPreferencesSubmit() {
    if (this.preferencesForm.valid) {
      this.isSaving.set(true);
      try {
        const preferences = this.preferencesForm.value as UserPreferences;
        await (this.userProfileService.updatePreferences(preferences) as Promise<void>);
        this.userPreferences.set(preferences);
        this.successMessage.set('Preferences updated successfully');

        // Apply theme change immediately
        if (preferences.theme !== 'auto') {
          document.documentElement.setAttribute('data-theme', preferences.theme);
        }
      } catch (error) {
        this.errorMessage.set('Failed to update preferences');
      } finally {
        this.isSaving.set(false);
      }
    }
  }

  async onSecuritySubmit() {
    if (this.securityForm.valid) {
      this.isSaving.set(true);
      try {
        const { currentPassword, newPassword } = this.securityForm.value;
        await (this.userProfileService.changePassword(currentPassword, newPassword) as Promise<void>);
        this.successMessage.set('Password changed successfully');
        this.securityForm.reset();
      } catch (error) {
        this.errorMessage.set('Failed to change password');
      } finally {
        this.isSaving.set(false);
      }
    }
  }

  async toggleTwoFactor() {
    try {
      const enabled = !this.securitySettings().twoFactorEnabled;
      await (this.userProfileService.toggleTwoFactor(enabled) as Promise<void>);

      this.securitySettings.update(settings => ({
        ...settings,
        twoFactorEnabled: enabled
      }));

      this.successMessage.set(
        enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'
      );
    } catch (error) {
      this.errorMessage.set('Failed to update two-factor authentication');
    }
  }

  async removeTrustedDevice(deviceId: string) {
    try {
      await (this.userProfileService.removeTrustedDevice(deviceId) as Promise<void>);

      this.securitySettings.update(settings => ({
        ...settings,
        trustedDevices: settings.trustedDevices.filter(d => d.id !== deviceId)
      }));

      this.successMessage.set('Trusted device removed');
    } catch (error) {
      this.errorMessage.set('Failed to remove trusted device');
    }
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return this.getPatternError(fieldName);
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      jobTitle: 'Job title',
      bio: 'Bio',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password'
    };
    return labels[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    const errors: Record<string, string> = {
      firstName: 'First name can only contain letters, spaces, hyphens, and apostrophes',
      lastName: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      phone: 'Please enter a valid phone number',
      newPassword: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character'
    };
    return errors[fieldName] || 'Invalid format';
  }

  private clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  formatDate(date: Date): string {
    const preferences = this.userPreferences();
    const locale = preferences.language === 'fr' ? 'fr-FR' : 'en-US';

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}

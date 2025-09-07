import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  avatar?: string;
}

export interface UserPreferences {
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

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  browser: string;
  os: string;
  lastUsed: Date;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_BASE_URL = 'http://localhost:4000';

  // Profile Management
  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    const headers = this.authService.getAuthHeaders();

    try {
      await this.http.put(`${this.API_BASE_URL}/customer/profile`, profile, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const headers = this.authService.getAuthHeaders();

    try {
      const response = await this.http.post<{ avatarUrl: string }>(`${this.API_BASE_URL}/customer/profile/avatar`, formData, { headers }).toPromise();
      return response?.avatarUrl || '';
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  // Preferences Management
  async getUserPreferences(): Promise<UserPreferences | null> {
    const headers = this.authService.getAuthHeaders();

    try {
      const response = await this.http.get<UserPreferences>(`${this.API_BASE_URL}/customer/preferences`, { headers }).toPromise();
      return response || null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  async updatePreferences(preferences: UserPreferences): Promise<void> {
    const headers = this.authService.getAuthHeaders();

    try {
      await this.http.put(`${this.API_BASE_URL}/customer/preferences`, preferences, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  // Security Management
  async getSecuritySettings(): Promise<SecuritySettings | null> {
    const headers = this.authService.getAuthHeaders();

    try {
      const response = await this.http.get<SecuritySettings>(`${this.API_BASE_URL}/customer/security`, { headers }).toPromise();
      return response || null;
    } catch (error) {
      console.error('Failed to get security settings:', error);
      return null;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const headers = this.authService.getAuthHeaders();

    try {
      await this.http.post(`${this.API_BASE_URL}/customer/security/change-password`, {
        currentPassword,
        newPassword
      }, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to change password:', error);
      throw new Error('Failed to change password');
    }
  }

  async toggleTwoFactor(enabled: boolean): Promise<void> {
    const headers = this.authService.getAuthHeaders();

    try {
      await this.http.post(`${this.API_BASE_URL}/customer/security/two-factor`, {
        enabled
      }, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to toggle two-factor authentication:', error);
      throw new Error('Failed to update two-factor authentication');
    }
  }

  async removeTrustedDevice(deviceId: string): Promise<void> {
    const headers = this.authService.getAuthHeaders();

    try {
      await this.http.delete(`${this.API_BASE_URL}/customer/security/trusted-devices/${deviceId}`, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to remove trusted device:', error);
      throw new Error('Failed to remove trusted device');
    }
  }

  // Account Management
  async deleteAccount(password: string): Promise<void> {
    const headers = this.authService.getAuthHeaders();

    try {
      await this.http.post(`${this.API_BASE_URL}/customer/account/delete`, {
        password
      }, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw new Error('Failed to delete account');
    }
  }

  async exportData(): Promise<Blob> {
    const headers = this.authService.getAuthHeaders();

    try {
      const response = await this.http.get(`${this.API_BASE_URL}/customer/account/export`, {
        headers,
        responseType: 'blob'
      }).toPromise();
      return response || new Blob();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  // Utility methods
  validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Bonus points
    if (password.length >= 12) score += 1;
    if (/[^a-zA-Z0-9@$!%*?&]/.test(password)) score += 1;

    return {
      score: Math.min(score, 5),
      feedback,
      isStrong: score >= 4
    };
  }

  generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';

    // Ensure at least one character from each required set
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

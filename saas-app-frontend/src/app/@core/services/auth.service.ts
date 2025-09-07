import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  plan: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly currentUser = computed(() => this.authState().user);
  readonly authToken = computed(() => this.authState().token);

  constructor(private router: Router) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Check for stored auth data
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.authState.set({
          isAuthenticated: true,
          user,
          token: storedToken
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<{ success: boolean; message: string }> {
    // In a real app, this would make an HTTP request to your backend
    return new Observable(observer => {
      setTimeout(() => {
        // Mock authentication - replace with real API call
        if (email === 'demo@example.com' && password === 'password') {
          const mockUser: User = {
            id: '1',
            username: 'demo_user',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            isVerified: true,
            plan: 'YZ-PLAN-1'
          };

          const mockToken = 'mock_jwt_token_' + Date.now();
          
          this.setAuth(mockUser, mockToken);
          observer.next({ success: true, message: 'Login successful' });
        } else {
          observer.next({ success: false, message: 'Invalid credentials' });
        }
        observer.complete();
      }, 1000);
    });
  }

  signup(userData: any): Observable<{ success: boolean; message: string }> {
    // In a real app, this would make an HTTP request to your backend
    return new Observable(observer => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isVerified: false,
          plan: userData.plan || 'YZ-PLAN-1'
        };

        const mockToken = 'mock_jwt_token_' + Date.now();
        
        this.setAuth(newUser, mockToken);
        observer.next({ success: true, message: 'Account created successfully' });
        observer.complete();
      }, 1500);
    });
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/signup']);
  }

  private setAuth(user: User, token: string): void {
    this.authState.set({
      isAuthenticated: true,
      user,
      token
    });

    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private clearAuth(): void {
    this.authState.set({
      isAuthenticated: false,
      user: null,
      token: null
    });

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  refreshToken(): Observable<boolean> {
    // In a real app, this would refresh the JWT token
    return new Observable(observer => {
      setTimeout(() => {
        const currentToken = this.authToken();
        if (currentToken) {
          const newToken = 'refreshed_token_' + Date.now();
          const currentUser = this.currentUser();
          
          if (currentUser) {
            this.setAuth(currentUser, newToken);
            observer.next(true);
          } else {
            observer.next(false);
          }
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 500);
    });
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Mock permission logic - replace with real permission system
    const permissions: Record<string, string[]> = {
      'YZ-PLAN-1': ['read', 'create_widget'],
      'YZ-PLAN-2': ['read', 'create_widget', 'export_widget'],
      'YZ-PLAN-3': ['read', 'create_widget', 'export_widget', 'admin']
    };

    return permissions[user.plan]?.includes(permission) || false;
  }

  isEmailVerified(): boolean {
    return this.currentUser()?.isVerified || false;
  }
}

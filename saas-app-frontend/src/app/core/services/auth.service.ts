import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  applicationId?: string;
  permissions?: string[];
  avatar?: string;
  hasCompletedTour?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_BASE_URL = 'http://localhost:4000';
  private readonly TOKEN_KEY = 'saas_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'saas_refresh_token';
  private readonly USER_KEY = 'saas_user';

  // State management with signals
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false
  });

  // Public readonly signals
  readonly isAuthenticated = () => this.authState().isAuthenticated;
  readonly currentUser = () => this.authState().user;
  readonly isLoading = () => this.authState().isLoading;

  // Backward compatibility with observables
  private authStateSubject = new BehaviorSubject<AuthState>(this.authState());

  constructor() {
    this.initializeAuthState();

    // Sync signal changes with BehaviorSubject
    setInterval(() => {
      this.authStateSubject.next(this.authState());
    }, 100);
  }

  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const refreshToken = this.getStoredRefreshToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.updateAuthState({
        isAuthenticated: true,
        user,
        token,
        refreshToken,
        isLoading: false
      });

      // Validate token on startup
      this.validateToken().catch(() => {
        this.logout();
      });
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
    this.setLoading(true);

    try {
      const response = await this.http.post<any>(`${this.API_BASE_URL}/customer/auth/login`, {
        email,
        password,
        rememberMe
      }).toPromise();

      if (response.success && response.token) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role,
          applicationId: response.user.applicationId,
          permissions: response.user.permissions,
          avatar: response.user.avatar
        };

        this.setAuthData(user, response.token, response.refreshToken, rememberMe);

        return {
          success: true,
          user,
          token: response.token,
          refreshToken: response.refreshToken
        };
      } else {
        return {
          success: false,
          error: response.message || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.error?.message || 'Network error occurred'
      };
    } finally {
      this.setLoading(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${this.API_BASE_URL}/auth/google`;
  }

  async loginWithMicrosoft(): Promise<void> {
    // Redirect to backend Microsoft OAuth endpoint
    window.location.href = `${this.API_BASE_URL}/auth/microsoft`;
  }

  /**
   * Handle OAuth2 callback with tokens from URL parameters
   */
  handleOAuth2Callback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');

    // Accept either both tokens or just the main token
    if (token && (refreshToken || token)) {
      // Store tokens (use token as refreshToken if refreshToken is not provided)
      const actualRefreshToken = refreshToken || token;
      this.storeToken(token);
      this.storeRefreshToken(actualRefreshToken);

      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.userId,
          email: payload.email,
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          role: payload.role,
          permissions: payload.permissions || [],
          hasCompletedTour: false,
        };

        this.storeUser(user);

        // Update auth state
        this.updateAuthState({
          isAuthenticated: true,
          user,
          token,
          refreshToken: actualRefreshToken,
          isLoading: false
        });

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

      } catch (error) {
        console.error('Failed to decode OAuth2 token:', error);
        this.logout();
      }
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.http.post<any>(`${this.API_BASE_URL}/customer/auth/refresh`, {
        refreshToken
      }).toPromise();

      if (response.success && response.token) {
        const currentState = this.authState();
        this.updateAuthState({
          ...currentState,
          token: response.token,
          refreshToken: response.refreshToken || refreshToken
        });

        this.storeToken(response.token);
        if (response.refreshToken) {
          this.storeRefreshToken(response.refreshToken);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async validateToken(): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) {
      return false;
    }

    try {
      const response = await this.http.post<any>(`${this.API_BASE_URL}/customer/auth/verify`, { token }).toPromise();

      return response.valid === true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  logout(): void {
    this.clearAuthData();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false
    });
    this.router.navigate(['/login']);
  }

  private setAuthData(user: User, token: string, refreshToken?: string, rememberMe: boolean = false): void {
    this.updateAuthState({
      isAuthenticated: true,
      user,
      token,
      refreshToken: refreshToken || null,
      isLoading: false
    });

    // Store in localStorage or sessionStorage based on rememberMe
    const storage = rememberMe ? localStorage : sessionStorage;

    this.storeToken(token, storage);
    this.storeUser(user, storage);
    if (refreshToken) {
      this.storeRefreshToken(refreshToken, storage);
    }
  }

  private clearAuthData(): void {
    // Clear from both storages
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    });
  }

  private updateAuthState(newState: AuthState): void {
    this.authState.set(newState);
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authState();
    this.updateAuthState({
      ...currentState,
      isLoading: loading
    });
  }

  // Storage methods
  private storeToken(token: string, storage: Storage = localStorage): void {
    storage.setItem(this.TOKEN_KEY, token);
  }

  private storeRefreshToken(refreshToken: string, storage: Storage = localStorage): void {
    storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private storeUser(user: User, storage: Storage = localStorage): void {
    storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        return null;
      }
    }
    return null;
  }

  // Token utilities
  getAuthToken(): string | null {
    return this.authState().token;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  // User utilities
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Observable getters for backward compatibility
  get authState$(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(map(state => state.isAuthenticated));
  }

  get currentUser$(): Observable<User | null> {
    return this.authState$.pipe(map(state => state.user));
  }
}
